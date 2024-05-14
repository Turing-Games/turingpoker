import { ServerUpdateMessage } from "@tg/shared";
import * as Poker from '@tg/game-logic/poker';

function describeAction(action: Poker.Action): string {
    switch (action.type) {
        case "raise":
            return `raised ${action.amount}`;
        case "call":
            return `calls`;
        case "fold":
            return `folds`;
        default:
            return "";
    }
}

function describePayouts(payouts: Record<string, number>): string {
    return Object.entries(payouts).map(([player, amount]) => `${player}: ${amount}`).join(", ");
}

function getLogMessage(log: ServerUpdateMessage): string {
    switch (log.type) {
        case "player-joined":
            return `${log.player.playerId.slice(0, 10)} has joined the game`;
        case "player-left":
            return `${log.player.playerId.slice(0, 10)} has left the game`;
        case "action":
            return `${log.player.playerId.slice(0, 10)} ${describeAction(log.action)}`;
        case "game-started":
            return `Game has started`;
        case "game-ended":
            return `Game has ended, ${describePayouts(log.payouts)}`;
        default:
            return "";
    }
}

interface GameLogProps {
    gameLog: ServerUpdateMessage[];
}

function GameLog({ gameLog }: GameLogProps): JSX.Element {
    return (
        <div className="tg-poker__gamelog">
            <h4>Game Log</h4>
            {gameLog.map((log, index) => (
                <div className="tg-poker__gamelog__log" key={index}>
                    <p>{getLogMessage(log)}</p>
                </div>
            ))}
        </div>
    );
}

export default GameLog;