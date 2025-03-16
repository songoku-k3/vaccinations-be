export const getAppointmentReminderTemplate = (
  userName: string,
  vaccineName: string,
  appointmentDate: Date,
  location: string,
): { subject: string; html: string } => {
  const subject = 'Nhắc nhở lịch hẹn tiêm chủng';
  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: #007bff;
                color: white;
                padding: 20px;
                text-align: center;
            }
            .content {
                padding: 25px;
            }
            .appointment-info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 15px 0;
            }
            .footer {
                text-align: center;
                padding: 20px;
                font-size: 12px;
                color: #666;
                background: #f8f9fa;
            }
            .btn {
                display: inline-block;
                padding: 10px 20px;
                background: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 15px;
            }
            h2 {
                margin: 0;
                font-size: 24px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Nhắc Nhở Lịch Hẹn Tiêm Chủng</h2>
            </div>
            <div class="content">
                <p>Xin chào <strong>${userName}</strong>,</p>
                <p>Chúng tôi gửi email này để nhắc nhở bạn về lịch hẹn tiêm chủng sắp tới:</p>
                
                <div class="appointment-info">
                    <p><strong>Vaccine:</strong> ${vaccineName}</p>
                    <p><strong>Thời gian:</strong> ${appointmentDate.toLocaleString(
                      'vi-VN',
                      {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}</p>
                    <p><strong>Địa điểm:</strong> ${location || 'Chưa xác định'}</p>
                </div>

                <p>Vui lòng đến đúng giờ và mang theo giấy tờ tùy thân. Nếu bạn cần thay đổi lịch hẹn, hãy liên hệ với chúng tôi sớm nhất có thể.</p>
                
                <a href="#" class="btn">Xem Chi Tiết Lịch Hẹn</a>
            </div>
            <div class="footer">
                <p>Trân trọng,<br>Hệ thống Quản lý Tiêm chủng<br>Email: support@tiemchung.vn | Hotline: 1900 1234</p>
                <p>Nếu bạn không đăng ký lịch hẹn này, vui lòng liên hệ chúng tôi ngay.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return { subject, html };
};
