import { Global, Module } from '@nestjs/common';
import { SpacetimeService } from './spacetime.service';

@Global()
@Module({
  providers: [SpacetimeService],
  exports: [SpacetimeService],
})
export class SpacetimeModule {}
