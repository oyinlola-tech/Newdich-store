import { Command } from '../../../../../core/application/commands/command.js';
import type { RequestOtpResult } from '../../services/otp.service.js';
import type { RequestOtpDto } from '../../../../auth/presentation/dto/otp.dto.js';

export class RequestOtpCommand extends Command<RequestOtpResult> {
  constructor(readonly dto: RequestOtpDto) {
    super();
  }
}
