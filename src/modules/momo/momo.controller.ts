import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCommonResponses } from 'src/decorator/api-common-responses.decorator';
import { CommonPagination } from 'src/decorator/common-pagination.decorator';
import { ApiTagController } from 'src/decorator/common.decorator';
import { CurrentUserId } from 'src/decorator/current-user-id.decorator';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import {
  MomoDto,
  MomoIpnDto,
  PaymentPaginationResponse,
} from 'src/modules/momo/dto/momo';
import { MomoService } from 'src/modules/momo/momo.service';
import { RequestWithUser } from 'src/types/users';

@ApiTagController('momo')
@Controller('momo')
export class MomoController {
  constructor(private readonly momoService: MomoService) {}

  @UseGuards(HandleAuthGuard)
  @Get('payment')
  @CommonPagination()
  @ApiCommonResponses('Lấy danh sách giao dịch')
  async getPaymentUrl(
    @Pagination() pagination: PaginationParams,
  ): Promise<PaymentPaginationResponse> {
    return this.momoService.getPaymentAll(pagination);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Lấy danh sách giao dịch theo user')
  @Get('user')
  async getPaymentsByUser(@CurrentUserId() userId: string) {
    return this.momoService.getPaymentUser(userId);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Lấy chi tiết giao dịch')
  @Get('payment/:id')
  async getPaymentDetail(@Param('id') id: string) {
    return this.momoService.getPaymentById(id);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Đếm số lượng giao dịch thành công')
  @Get('count-payment-success')
  async countSuccessPayment() {
    return this.momoService.getCountPaymentDone();
  }

  @Post('payment')
  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Tạo giao dịch thanh toán')
  async createPayment(@Body() momoDto: MomoDto, @Req() req: RequestWithUser) {
    const paymentUrl = await this.momoService.createPayment(
      momoDto,
      req.user.id,
    );
    return { paymentUrl };
  }

  @Get('payment-status')
  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Kiểm tra trạng thái thanh toán')
  async checkPaymentStatus(
    @Query('orderId') orderId: string,
    @Query('requestId') requestId: string,
  ) {
    const result = await this.momoService.checkPaymentStatus(
      orderId,
      requestId,
    );
    return result;
  }

  @Post('ipn')
  @ApiCommonResponses('Xử lý IPN từ Momo')
  @HttpCode(HttpStatus.OK)
  async handleMomoIpn(@Body() ipnData: MomoIpnDto) {
    console.log('ipnData:', ipnData);
    return this.momoService.handleIpn(ipnData);
  }
}
