import { Global, Module, CacheModule } from '@nestjs/common';
import * as fsStore from 'cache-manager-fs-hash';

/**
 * TODO right now we're using a file system cache for simplicity, at some point we should switch to redis or something
 */
@Global()
@Module({
    imports: [CacheModule.register({
        store: fsStore,
        path:'/tmp/diskcache',
        ttl: parseInt(process.env.DEFAULT_CACHE_TTL, 10),
        max: 1000
    })],
    exports: [CacheModule]
})
export class GlobalCacheModule {}