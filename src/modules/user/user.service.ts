import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { hash } from 'crypto';
import { isEqual } from 'lodash';
import { FileUploadService } from 'src/lib/file-upload.service';
import { UpdateUserDto, UserFilterType } from 'src/modules/user/dto/user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private fileUploadService: FileUploadService,
    private jwtService: JwtService,
  ) {}

  async getAll(filters: UserFilterType): Promise<any> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const users = await this.prismaService.user.findMany({
      where,
      skip,
      take: items_per_page,
      select: {
        id: true,
        email: true,
        phone: true,
        address: true,
        avatar: true,
        name: true,
        date_of_birth: true,
        country: true,
        createAt: true,
        updateAt: true,
        verificationCode: true,
        verificationCodeExpiresAt: true,
        isVerified: true,
        role: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createAt: 'desc',
      },
    });

    const totalUsers = await this.prismaService.user.count({ where });

    return {
      data: users,
      total: totalUsers,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getDetail(id: string): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        address: true,
        avatar: true,
        name: true,
        date_of_birth: true,
        country: true,
        createAt: true,
        updateAt: true,
        verificationCode: true,
        verificationCodeExpiresAt: true,
        isVerified: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async updateMeUser(data: UpdateUserDto, id: string): Promise<User> {
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async updateUserRole(
    userId: string,
    roleId: string,
    currentUserId: string,
  ): Promise<User> {
    if (isEqual(userId, currentUserId)) {
      throw new ForbiddenException('You cannot update your own role.');
    }

    const role = await this.prismaService.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new HttpException(
        { message: 'Role not found.' },
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.prismaService.user.update({
      where: { id: userId },
      data: { roleId },
    });
  }

  async updateAvatarS3(
    userId: string,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const avatarUrl = await this.fileUploadService.uploadImageToS3(
      file,
      'avatars',
    );

    return await this.prismaService.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });
  }

  async deleteUser(userId: string, currentUserId: string) {
    const userToDelete = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!userToDelete) {
      throw new NotFoundException('User không tồn tại');
    }

    if (isEqual(userToDelete.role?.name, 'ADMIN')) {
      throw new ForbiddenException('Không thể xóa tài khoản có vai trò ADMIN');
    }

    if (isEqual(userToDelete.id, currentUserId)) {
      throw new ForbiddenException('Không thể tự xóa chính mình');
    }

    await this.prismaService.user.delete({
      where: { id: userId },
    });

    return { message: 'Xóa user thành công' };
  }

  async getCountUser(): Promise<{ data: { total: number } }> {
    const totalUsers = await this.prismaService.user.count();
    return { data: { total: totalUsers } };
  }

  // get list user by role === USER
  async getListUserByRole(): Promise<User[]> {
    return this.prismaService.user.findMany({
      where: { role: { name: 'USER' } },
    });
  }
  async initAdminAccount() {
    const accountCount = await this.prismaService.user.count();
    if (accountCount > 0) {
      console.log('Tài khoản đã tồn tại, không cần khởi tạo admin.');
      return;
    }

    const hashedPassword = await hash(
      process.env.ADMIN_PASSWORD,
      'sha256',
      'hex',
    );
    const owner = await this.prismaService.user.create({
      data: {
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        name: 'Admin',
        role: {
          connect: {
            name: 'ADMIN',
          },
        },
      },
      include: {
        role: true,
      },
    });
    console.log(
      `Khởi tạo tài khoản admin thành công: ${owner.email}|${owner.password}`,
    );
  }
}
