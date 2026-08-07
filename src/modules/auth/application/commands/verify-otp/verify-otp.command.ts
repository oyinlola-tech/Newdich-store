import { Command } from '../../../../../core/application/commands/command.js';
import type { VerifyOtpResult } from '../../services/auth.service.js';
import type { VerifyOtpDto } from '../../../../auth/presentation/dto/otp.dto.js';

export class VerifyOtpCommand extends Command<VerifyOtpResult> {
  constructor(
    readonly dto: VerifyOtpDto,
    readonly ip?: string,
    readonly userAgent?: string
  ) {
    super();
  }
}
