import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { RequestOtpCommand } from './request-otp.command.js';
import { OtpService, RequestOtpResult } from '../../services/otp.service.js';
import { OtpValueObject } from '../../../../auth/domain/value-objects/otp.value-object.js';

export class RequestOtpHandler implements CommandHandler<RequestOtpCommand, RequestOtpResult> {
  readonly commandName = RequestOtpCommand.name;

  constructor(private readonly otpService: OtpService) {}

  handle(command: RequestOtpCommand): Promise<RequestOtpResult> {
    return this.otpService.request(
      command.dto.email,
      OtpValueObject.purposeFromInput(command.dto.purpose)
    );
  }
}
