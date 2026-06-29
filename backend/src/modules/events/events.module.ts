import { Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsGateway } from './events.gateway';
import { EventsController } from './events.controller';

@Module({
  controllers: [EventsController],
  providers: [
    EventsGateway,
    {
      provide: EventEmitter2,
      useValue: new EventEmitter2({
        wildcard: false,
        delimiter: '.',
        newListener: false,
        removeListener: false,
        maxListeners: 10,
        verboseMemoryLeak: false,
        ignoreErrors: false,
      }),
    },
  ],
  exports: [EventsGateway, EventEmitter2],
})
export class EventsModule {}