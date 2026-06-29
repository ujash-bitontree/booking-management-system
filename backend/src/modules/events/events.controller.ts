import { Controller, Get, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { EventsGateway } from './events.gateway';

@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsGateway: EventsGateway) { }

  @Get('stream')
  async stream(@Req() req: Request & { user: { sub: string } }, @Res() res: Response) {
    const userId = req.user.sub;
    this.logger.log(`SSE stream connected for user: ${userId}`);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // const send = (data: string) => {
    //   res.write(data);
    //   res.write('\n\n');
    // };
    const send = (payload: unknown) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    this.eventsGateway.addConnection(userId, send);

    req.on('close', () => {
      this.logger.log(`SSE stream disconnected for user: ${userId}`);
      this.eventsGateway.removeConnection(userId, send);
    });

    res.on('close', () => {
      this.logger.log(`SSE stream closed for user: ${userId}`);
      this.eventsGateway.removeConnection(userId, send);
    });

    res.flushHeaders();

    // send(JSON.stringify({ event: 'connected', data: { userId } }));
    send({
      event: 'connected',
      data: { userId },
    });
  }
}