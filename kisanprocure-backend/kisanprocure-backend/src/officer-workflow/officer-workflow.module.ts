import { Module } from '@nestjs/common';
import { OfficerWorkflowController } from './officer-workflow.controller';
import { OfficerWorkflowService } from './officer-workflow.service';
import { PrismaModule } from '../common/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OfficerWorkflowController],
  providers: [OfficerWorkflowService],
  exports: [OfficerWorkflowService],
})
export class OfficerWorkflowModule {}
