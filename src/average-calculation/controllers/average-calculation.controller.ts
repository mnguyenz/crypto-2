import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AverageCalculationService } from '~average-calculation/services/average-calculation.service';
import { GetAverageResponse } from '~average-calculation/types/get-average-response.type';

@Controller('average-calculation')
@ApiTags('Average Calculation')
export class AverageCalculationController {
    constructor(private averageCalculationService: AverageCalculationService) {}

    @Get('/:asset')
    getAverage(@Param('asset') asset: string): Promise<GetAverageResponse> {
        return this.averageCalculationService.getAverageByAsset(asset);
    }
}
