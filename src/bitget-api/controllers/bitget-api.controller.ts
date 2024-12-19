import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BuyMinimumDto } from '~bitget-api/dtos/buy-minimum.dto';
import { BitgetOrderService } from '~bitget-api/services/bitget-order.service';

@Controller('bitget-api')
@ApiTags('Bitget API')
export class BitgetApiController {
    constructor(private bitgetOrderService: BitgetOrderService) {}

    @Post('buy-min')
    buyMinimum(@Body() dto: BuyMinimumDto): Promise<void> {
        return this.bitgetOrderService.buyMinimum(dto.symbol);
    }
}
