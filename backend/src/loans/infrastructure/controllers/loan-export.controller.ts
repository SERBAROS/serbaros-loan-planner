import { Controller, Get, Inject, Param, ParseIntPipe, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentUserId } from '../../../shared/decorators/current-user-id.decorator';

import { BuildLoanExportDataUseCase } from '../../application/use-cases/build-loan-export-data.use-case';
import { EXCEL_EXPORTER, ExcelExporterPort } from '../../domain/ports/excel-exporter.port';
import { PDF_EXPORTER, PdfExporterPort } from '../../domain/ports/pdf-exporter.port';

function slug(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
}

@Controller('loans/:loanId/export')
@UseGuards(JwtAuthGuard)
export class LoanExportController {
  constructor(
    private readonly buildLoanExportDataUseCase: BuildLoanExportDataUseCase,
    @Inject(EXCEL_EXPORTER) private readonly excelExporter: ExcelExporterPort,
    @Inject(PDF_EXPORTER) private readonly pdfExporter: PdfExporterPort,
  ) {}

  @Get('excel')
  async excel(
    @CurrentUserId() userId: number,
    @Param('loanId', ParseIntPipe) loanId: number,
    @Res() res: Response,
  ) {
    const data = await this.buildLoanExportDataUseCase.execute(loanId, userId);
    const buffer = await this.excelExporter.generate(data);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="serbaros-loan-planner-${slug(data.loan.nombre)}.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('pdf')
  async pdf(
    @CurrentUserId() userId: number,
    @Param('loanId', ParseIntPipe) loanId: number,
    @Res() res: Response,
  ) {
    const data = await this.buildLoanExportDataUseCase.execute(loanId, userId);
    const buffer = await this.pdfExporter.generate(data);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="serbaros-loan-planner-${slug(data.loan.nombre)}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}
