import { SetMetadata } from '@nestjs/common';

export const TYPEORM_EX_CUSTOM_REPOSITORY = 'TYPEORM_EX_CUSTOM_REPOSITORY';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function CustomRepository(entity: Function): ClassDecorator {
    return SetMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, entity);
}
