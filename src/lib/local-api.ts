// Auto-generated local API router
import * as Route0 from './api/export/route';
import * as Route1 from './api/import/route';
import * as Route2 from './api/matches/route';
import * as Route3 from './api/matches/[id]/cards/route';
import * as Route4 from './api/matches/[id]/events/route';
import * as Route5 from './api/matches/[id]/goals/route';
import * as Route6 from './api/matches/[id]/penalties/route';
import * as Route7 from './api/matches/[id]/players/route';
import * as Route8 from './api/matches/[id]/route';
import * as Route9 from './api/matches/[id]/substitutions/route';
import * as Route10 from './api/matches/[id]/timer/complete/route';
import * as Route11 from './api/matches/[id]/timer/extra-time/route';
import * as Route12 from './api/matches/[id]/timer/halftime/route';
import * as Route13 from './api/matches/[id]/timer/pause/route';
import * as Route14 from './api/matches/[id]/timer/route';
import * as Route15 from './api/matches/[id]/timer/second-half/route';
import * as Route16 from './api/matches/[id]/timer/start/route';
import * as Route17 from './api/matches/[id]/undo/route';
import * as Route18 from './api/migrate/route';
import * as Route19 from './api/players/[playerId]/route';
import * as Route20 from './api/settings/clear/route';
import * as Route21 from './api/settings/route';
import * as Route22 from './api/tournaments/route';
import * as Route23 from './api/tournaments/[id]/route';
import * as Route24 from './api/tournaments/[id]/standings/recalculate/route';
import * as Route25 from './api/tournaments/[id]/standings/route';

const routes = [
  { regex: new RegExp('^/api/export$'), handler: Route0 },
  { regex: new RegExp('^/api/import$'), handler: Route1 },
  { regex: new RegExp('^/api/matches$'), handler: Route2 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)/cards$'), handler: Route3 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)/events$'), handler: Route4 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)/goals$'), handler: Route5 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)/penalties$'), handler: Route6 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)/players$'), handler: Route7 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)$'), handler: Route8 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)/substitutions$'), handler: Route9 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)/timer/complete$'), handler: Route10 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)/timer/extra-time$'), handler: Route11 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)/timer/halftime$'), handler: Route12 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)/timer/pause$'), handler: Route13 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)/timer$'), handler: Route14 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)/timer/second-half$'), handler: Route15 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)/timer/start$'), handler: Route16 },
  { regex: new RegExp('^/api/matches/(?<id>[^/]+)/undo$'), handler: Route17 },
  { regex: new RegExp('^/api/migrate$'), handler: Route18 },
  { regex: new RegExp('^/api/players/(?<playerId>[^/]+)$'), handler: Route19 },
  { regex: new RegExp('^/api/settings/clear$'), handler: Route20 },
  { regex: new RegExp('^/api/settings$'), handler: Route21 },
  { regex: new RegExp('^/api/tournaments$'), handler: Route22 },
  { regex: new RegExp('^/api/tournaments/(?<id>[^/]+)$'), handler: Route23 },
  { regex: new RegExp('^/api/tournaments/(?<id>[^/]+)/standings/recalculate$'), handler: Route24 },
  { regex: new RegExp('^/api/tournaments/(?<id>[^/]+)/standings$'), handler: Route25 }
];

export async function localApiRouter(req: Request): Promise<Response | null> {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    for (const route of routes) {
        const match = pathname.match(route.regex);
        if (match) {
            const method = req.method as keyof typeof route.handler;
            const handlerFn = route.handler[method];
            if (handlerFn) {
                const params = match.groups ? Promise.resolve(match.groups) : Promise.resolve({});
                return (handlerFn as any)(req, { params });
            } else {
                return new Response('Method Not Allowed', { status: 405 });
            }
        }
    }
    
    return null;
}
