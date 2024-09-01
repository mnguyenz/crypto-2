import { Global, Module } from '@nestjs/common';
import { OkxSocketGateway } from './socket/okx-socket.gateway';

@Global()
@Module({
    imports: [],
    providers: [OkxSocketGateway],
    exports: []
})
export class OkxApiModule {}
