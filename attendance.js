const express = require('express');
const admin = require('firebase-admin');
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');

const router = express.Router();
const db = admin.firestore();

// Endpoint: POST /api/attendance/export-monthly
router.post('/export-monthly', async (req, res) => {
  try {
    const targetEmail = 'shubanshree@gmail.com'; // Hardcoded recipient security requirement

    // 1. Calculate Start and End of Current Month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const startISO = startOfMonth.toISOString().split('T')[0]; // "YYYY-MM-01"
    const endISO = endOfMonth.toISOString().split('T')[0];     // "YYYY-MM-31"

    // 2. Query Firestore Attendance for Current Month
    const attendanceSnapshot = await db.collection('attendance')
      .where('date', '>=', startISO)
      .where('date', '<=', endISO)
      .get();

    if (attendanceSnapshot.empty) {
      return res.status(404).json({ success: false, message: "No attendance records found for the current month." });
    }

    // 3. Create Excel Workbook and Worksheet
    const workbook = new ExcelJS.Workbook();
    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const worksheet = workbook.addWorksheet(`Attendance ${monthName}`);

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Student ID', key: 'student_id', width: 20 },
      { header: 'Student Name', key: 'student_name', width: 25 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };

    // Add rows from Firestore
    attendanceSnapshot.forEach(doc => {
      const record = doc.data();
      worksheet.addRow({
        date: record.date || '',
        student_id: record.studentId || record.student_id || '',
        student_name: record.studentName || record.name || '',
        status: record.status || 'Present'
      });
    });

    // Write to Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 4. Configure Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,    // Your sender Gmail address
        pass: process.env.SMTP_PASSWORD  // App Password generated from Google Account
      }
    });

    // 5. Send Email with Attachment
    const mailOptions = {
      from: `"Attendance System" <${process.env.SMTP_EMAIL}>`,
      to: targetEmail,
      subject: `📊 Monthly Attendance Report - ${monthName}`,
      text: `Hello,\n\nPlease find attached the overall attendance report for ${monthName}.\n\nBest regards,\nAttendance Management System`,
      attachments: [
        {
          filename: `Attendance_Report_${now.getFullYear()}_${now.getMonth() + 1}.xlsx`,
          content: buffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "Report sent successfully." });

  } catch (error) {
    console.error("Error generating/sending attendance report:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;