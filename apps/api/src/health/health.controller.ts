import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API and database availability' })
  @ApiOkResponse({ description: 'API and database are healthy' })
  check() {
    return this.healthCheckService.check([
      () => this.typeOrmHealthIndicator.pingCheck('database'),
    ]);
  }
}
