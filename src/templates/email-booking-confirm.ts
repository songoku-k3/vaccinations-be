import { Booking } from '@prisma/client';

export const emailConfirmBooking = (
  booking: Booking,
  productName: string,
  totalProducts: number,
  formattedTotalAmount: string,
) => {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <header style="text-align: center; padding: 10px 0; border-bottom: 1px solid #ddd;">
          <img src="https://travel-golobe-web.s3.ap-southeast-1.amazonaws.com/avatars/85367661-7c4b-4d0b-8873-580af5e43191.png" alt="Company Logo" style="width: 120px;">
        </header>
        <section style="padding: 20px;">
          <h2 style="color: #2C3E50;">Xin chào, ${booking}</h2>
          <p>Cảm ơn bạn đã đặt chỗ trên website của chúng tôi. Dưới đây là thông tin chi tiết về đơn đặt hàng của bạn:</p>
          <div style="padding: 15px; background-color: #f7f7f7; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #2C3E50;">Thông tin đơn hàng</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; color: #555;">Mã đơn hàng:</td>
                <td style="padding: 10px; font-weight: bold;">${booking.id}</td>
              </tr> 
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; color: #555;">Tên vaccine:</td>
                <td style="padding: 10px; font-weight: bold;">${productName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; color: #555;">Số lượng vaccine đặt:</td>
                <td style="padding: 10px; font-weight: bold;">${totalProducts}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; color: #555;">Ngày đặt:</td>
                <td style="padding: 10px;">${new Date(booking.createdAt).toLocaleString()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; color: #555;">Tổng số tiền:</td>
                <td style="padding: 10px; font-weight: bold; color: #e74c3c;">${formattedTotalAmount}</td>
              </tr>
            </table>
          </div>
          <p style="margin-top: 20px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại bên dưới.</p>
          <p>Chúc bạn có một trải nghiệm tuyệt vời!</p>
        </section>
        <footer style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #777;">
          <p>Đội ngũ Hỗ trợ Khách hàng</p>
          <p><a href="#" style="color: #3498db;">t.vercel.app</a></p>
          <p>Email: support@example.com | Hotline: 123-456-789</p>
        </footer>
      </div>
    </body>
  </html>
`;
};
