import { Module } from '@nestjs/common';
import { BitgetOrderService } from './services/bitget-order.service';
import { BitgetApiController } from './controllers/bitget-api.controller';

@Module({
    imports: [],
    controllers: [BitgetApiController],
    providers: [BitgetOrderService],
    exports: [BitgetOrderService]
})
export class BitgetApiModule {}
