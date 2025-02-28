import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({
    description: 'Tiêu đề của blog',
    example: 'Cách phòng ngừa bệnh cúm hiệu quả',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Nội dung của blog',
    example: 'Nội dung chi tiết về cách phòng ngừa bệnh cúm...',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Danh sách các ID của tag liên quan đến blog (tùy chọn)',
    type: [String],
    example: 'tag-id',
  })
  @IsOptional()
  @IsString()
  tagId?: string;
}
