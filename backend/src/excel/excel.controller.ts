import { Controller, Get, Post, Param, UseGuards, Res, UseInterceptors, UploadedFile, Body, Delete, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { ExcelService } from './excel.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('excel')
@Controller('excel')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('orders')
  @ApiOperation({ summary: 'Export all orders to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file with orders' })
  async exportOrders(@Res() res: Response): Promise<void> {
    const buffer = await this.excelService.exportOrders();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
    res.send(buffer);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Export single order to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file with single order' })
  async exportSingleOrder(@Param('id', ParseIntPipe) id: number, @Res() res: Response): Promise<void> {
    const buffer = await this.excelService.exportSingleOrder(id);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=order_${id}.xlsx`);
    res.send(buffer);
  }

  @Get('users')
  @ApiOperation({ summary: 'Export all users to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file with users' })
  async exportUsers(@Res() res: Response): Promise<void> {
    const buffer = await this.excelService.exportUsers();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    res.send(buffer);
  }

  @Post('products/import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import products from Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Products imported successfully' })
  async importProducts(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file provided' };
    }
    return this.excelService.importProducts(file.buffer);
  }

  @Post('dollar-rate')
  @ApiOperation({ summary: 'Update dollar rate for all products' })
  @ApiResponse({ status: 200, description: 'Dollar rate updated successfully' })
  async updateDollarRate(@Body() body: { dollar: number }) {
    return this.excelService.updateDollarRate(body.dollar);
  }

  @Delete('products')
  @ApiOperation({ summary: 'Delete all products' })
  @ApiResponse({ status: 200, description: 'All products deleted' })
  async deleteAllProducts() {
    await this.excelService.deleteAllProducts();
    return { message: 'All products deleted successfully' };
  }
}
