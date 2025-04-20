export interface BookingConfirmationTemplateParams {
  userName: string;
  bookingId: string;
  productName: string;
  vaccinationQuantity: number;
  createdAt: string;
  totalAmount: string;
  paymentMethod: string;
  qrCode: string;
}

export function getBookingConfirmationTemplate(
  params: BookingConfirmationTemplateParams,
): string {
  const {
    userName,
    bookingId,
    productName,
    vaccinationQuantity,
    createdAt,
    totalAmount,
    paymentMethod,
    qrCode,
  } = params;

  return `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; }
          a { text-decoration: none; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(90deg, #007bff, #0056b3); padding: 30px; text-align: center; }
          .header img { max-width: 150px; height: auto; }
          .content { padding: 30px 20px; }
          .content h2 { color: #1a2a44; font-size: 24px; margin: 0 0 10px; }
          .content p { color: #555; font-size: 16px; line-height: 1.6; margin: 10px 0; }
          .order-details { background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .order-details h3 { color: #1a2a44; font-size: 18px; margin: 0 0 15px; }
          .order-table { width: 100%; border-collapse: collapse; font-size: 14px; }
          .order-table td { padding: 12px 0; border-bottom: 1px solid #eee; color: #555; }
          .order-table td.label { font-weight: bold; width: 40%; }
          .order-table td.value { color: #1a2a44; }
          .order-table tr:last-child td { border-bottom: none; }
          .total { color: #e74c3c; font-weight: bold; font-size: 16px; }
          .qr-code { text-align: center; margin: 20px 0; }
          .qr-code img { max-width: 200px; height: auto; border: 1px solid #ddd; padding: 8px; border-radius: 4px; }
          .cta-button { text-align: center; margin: 20px 0; }
          .cta-button a { display: inline-block; padding: 12px 30px; background-color: #007bff; color: #ffffff; font-size: 16px; font-weight: bold; border-radius: 25px; }
          .cta-button a:hover { background-color: #0056b3; }
          .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #777; }
          .footer a { color: #007bff; }
          @media only screen and (max-width: 600px) {
            .container { margin: 10px; }
            .header { padding: 20px; }
            .content { padding: 20px; }
            .order-table td { display: block; width: 100%; }
            .order-table td.label { font-weight: normal; margin-bottom: 5px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
         <div class="header" style="background: linear-gradient(135deg, #0062cc, #0097a7); padding: 30px; text-align: center;">
  <img src="https://img.freepik.com/free-vector/pharmacy-logo-template_23-2148630940.jpg" alt="Vaccination Logo" style="max-width: 140px; height: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  <h1 style="color: white; font-size: 24px; margin-top: 15px; font-weight: 500;">VACCINE CENTER</h1>
</div>
          <div class="content">
            <h2>Xin chào, ${userName}</h2>
            <p>Cảm ơn bạn đã đặt chỗ trên hệ thống của chúng tôi! Dưới đây là thông tin chi tiết về đơn đặt hàng của bạn:</p>
            <div class="order-details">
              <h3>Thông tin đơn hàng</h3>
              <table class="order-table">
                <tr>
                  <td class="label">Mã đơn hàng:</td>
                  <td class="value">${bookingId}</td>
                </tr>
                <tr>
                  <td class="label">Tên vaccine:</td>
                  <td class="value">${productName}</td>
                </tr>
                <tr>
                  <td class="label">Số lượng vaccine:</td>
                  <td class="value">${vaccinationQuantity}</td>
                </tr>
                <tr>
                  <td class="label">Ngày đặt:</td>
                  <td class="value">${createdAt}</td>
                </tr>
                <tr>
                  <td class="label">Phương thức thanh toán:</td>
                  <td class="value">${paymentMethod}</td>
                </tr>
                <tr>
                  <td class="label">Tổng số tiền:</td>
                  <td class="value total">${totalAmount}</td>
                </tr>
              </table>
            </div>
            <div class="qr-code">
              <p>Vui lòng quét mã QR dưới đây tại quầy thanh toán:</p>
              <img src="${qrCode}" alt="QR Code for Payment" style="max-width: 200px; height: auto; border: 1px solid #ddd; padding: 8px; border-radius: 4px; background-color: #fff;">
            </div>
            <div class="cta-button">
              <a href="https://t.vercel.app/orders/${bookingId}" target="_blank">Xem chi tiết đơn hàng</a>
            </div>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại bên dưới.</p>
            <p>Chúc bạn có một trải nghiệm tuyệt vời!</p>
          </div>
          <div class="footer">
            <p>Đội ngũ Hỗ trợ Khách hàng</p>
            <p><a href="https://t.vercel.app">t.vercel.app</a></p>
            <p>Email: <a href="mailto:support@example.com">support@example.com</a> | Hotline: <a href="tel:123456789">123-456-789</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}
