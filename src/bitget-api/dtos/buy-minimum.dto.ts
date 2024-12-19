import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BINANCE_BITGET_SYMBOLS } from '~core/constants/crypto-code.constant';

export class BuyMinimumDto {
    @ApiProperty({
        example: BINANCE_BITGET_SYMBOLS.BTCUSDT
    })
    @IsNotEmpty()
    @IsString()
    symbol: string;
}
