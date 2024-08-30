import { ApiProperty } from '@nestjs/swagger';
import faker from 'faker';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ASSETS, OKX_BINGX_SYMBOLS } from '~core/constants/crypto-code.constant';
import { AccountEnum, ExchangeEnum } from '~core/enums/exchanges.enum';
import { OrderSideEnum } from '~core/enums/order.enum';

@Entity('Trade')
@Unique(['orderIdReference', 'exchange'])
export class TradeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: faker.datatype.string() })
    @Column()
    orderIdReference: string;

    @Column({ type: 'int' })
    tradeTime: number;

    @ApiProperty({ example: ASSETS.CRYPTO.BTC })
    @Column()
    asset: string;

    @ApiProperty({ example: OKX_BINGX_SYMBOLS.BTCUSDT })
    @Column()
    symbol: string;

    @ApiProperty({ example: OrderSideEnum.BUY })
    @Column()
    side: OrderSideEnum;

    @ApiProperty({ example: faker.datatype.number() })
    @Column('numeric')
    price: number;

    @ApiProperty({ example: faker.datatype.number() })
    @Column('numeric')
    quantity: number;

    @ApiProperty({ example: faker.datatype.number() })
    @Column('numeric')
    fee: number;

    @ApiProperty({ example: ASSETS.FIAT.USDT })
    @Column()
    feeAsset: string;

    @ApiProperty({ example: ExchangeEnum.BINANCE })
    @Column({ nullable: true })
    exchange: ExchangeEnum;

    @ApiProperty({ example: AccountEnum.M })
    @Column({ nullable: true })
    account: AccountEnum;
}
