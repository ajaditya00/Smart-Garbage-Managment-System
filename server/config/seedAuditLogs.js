import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './database.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

const seedAuditLogs = async () => {
  try {
    await connectDB();

    console.log('Generating initial Audit Logs from existing data...');
    const users = await User.find();
    const complaints = await Complaint.find().populate('userId').populate('assignedTo');

    const admin = users.find(u => u.role === 'admin') || users[0];

    const logs = [];

    // 1. Audit logs for User registrations (CREATE User)
    for (const u of users) {
      logs.push({
        action: 'CREATE',
        resource: 'User',
        resourceId: u._id.toString(),
        user: u._id,
        actor: {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role
        },
        target: {
          name: u.name,
          email: u.email,
          identifier: u._id.toString()
        },
        description: `User account "${u.name}" registered with role [${u.role.toUpperCase()}]`,
        details: {
          userId: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone
        },
        ipAddress: '192.168.1.10' + Math.floor(Math.random() * 9),
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'success',
        createdAt: u.createdAt || new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
      });

      // Sample login event for active users
      logs.push({
        action: 'LOGIN',
        resource: 'Auth',
        resourceId: u._id.toString(),
        user: u._id,
        actor: {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role
        },
        target: {
          name: u.name,
          email: u.email,
          identifier: u._id.toString()
        },
        description: `User "${u.name}" (${u.role.toUpperCase()}) authenticated successfully`,
        details: { email: u.email, role: u.role },
        ipAddress: '192.168.1.10' + Math.floor(Math.random() * 9),
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'success',
        createdAt: new Date((u.createdAt ? new Date(u.createdAt).getTime() : Date.now()) + 1000 * 60 * 5)
      });
    }

    // 2. Audit logs for Complaints (CREATE, ASSIGN, STATUS_CHANGE)
    for (const c of complaints) {
      const creator = c.userId || admin;

      // CREATE
      logs.push({
        action: 'CREATE',
        resource: 'Complaint',
        resourceId: c._id.toString(),
        user: creator._id,
        actor: {
          id: creator._id ? creator._id.toString() : null,
          name: creator.name || 'Citizen',
          email: creator.email || 'citizen@swachh.ai',
          role: creator.role || 'citizen'
        },
        target: {
          title: c.title,
          identifier: c._id.toString()
        },
        description: `Citizen "${creator.name}" reported garbage issue: "${c.title}"`,
        details: {
          title: c.title,
          category: c.category,
          address: c.location?.address,
          hasImage: !!c.image
        },
        ipAddress: '49.36.120.' + Math.floor(Math.random() * 200),
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        status: 'success',
        createdAt: c.createdAt || new Date(Date.now() - 1000 * 60 * 60 * 48)
      });

      // ASSIGN (if assigned)
      if (c.assignedTo) {
        logs.push({
          action: 'ASSIGN',
          resource: 'Complaint',
          resourceId: c._id.toString(),
          user: admin._id,
          actor: {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: 'admin'
          },
          target: {
            title: c.title,
            name: c.assignedTo.name,
            identifier: c._id.toString()
          },
          description: `Admin "${admin.name}" assigned complaint "${c.title}" to ${c.assignedType?.toUpperCase() || 'EMPLOYEE'} "${c.assignedTo.name}"`,
          details: {
            complaintId: c._id,
            assigneeId: c.assignedTo._id,
            assigneeName: c.assignedTo.name,
            assigneeType: c.assignedType
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          status: 'success',
          createdAt: new Date((c.createdAt ? new Date(c.createdAt).getTime() : Date.now()) + 1000 * 60 * 60)
        });
      }

      // STATUS_CHANGE (if verified or completed)
      if (c.status === 'completed' || c.status === 'verified') {
        const resolver = c.assignedTo || admin;
        logs.push({
          action: 'STATUS_CHANGE',
          resource: 'Complaint',
          resourceId: c._id.toString(),
          user: resolver._id,
          actor: {
            id: resolver._id.toString(),
            name: resolver.name,
            email: resolver.email,
            role: resolver.role || 'employee'
          },
          target: {
            title: c.title,
            identifier: c._id.toString()
          },
          description: `${resolver.role?.toUpperCase() || 'EMPLOYEE'} "${resolver.name}" marked cleanup as completed for "${c.title}"`,
          details: {
            previousStatus: 'in-progress',
            newStatus: 'completed',
            hasProofImage: !!c.proofImage
          },
          ipAddress: '49.36.120.' + Math.floor(Math.random() * 200),
          userAgent: 'Mozilla/5.0 (Android 14; Mobile)',
          status: 'success',
          createdAt: new Date((c.createdAt ? new Date(c.createdAt).getTime() : Date.now()) + 1000 * 60 * 60 * 5)
        });
      }

      if (c.status === 'verified') {
        logs.push({
          action: 'STATUS_CHANGE',
          resource: 'Complaint',
          resourceId: c._id.toString(),
          user: admin._id,
          actor: {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: 'admin'
          },
          target: {
            title: c.title,
            identifier: c._id.toString()
          },
          description: `Admin "${admin.name}" audited and verified cleanup completion for "${c.title}"`,
          details: {
            previousStatus: 'completed',
            newStatus: 'verified'
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          status: 'success',
          createdAt: new Date((c.createdAt ? new Date(c.createdAt).getTime() : Date.now()) + 1000 * 60 * 60 * 8)
        });
      }
    }

    await AuditLog.insertMany(logs);
    console.log(`Successfully seeded ${logs.length} audit log records!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding audit logs:', err);
    process.exit(1);
  }
};

seedAuditLogs();
