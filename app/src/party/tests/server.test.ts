import PartyServer from "@app/party/src/server"
describe('Poker server', () => {
    let server: PartyServer;
    let send = jest.fn();
    let getConnection = () => ({ send });
    beforeEach(() => {
        send = jest.fn();
        getConnection = () => ({ send });
        server = new PartyServer({ getConnection } as any);
    });

    test('Player spectates on connect', () => {
        server.onConnect({ id: '1' } as any, {} as any);
        expect(server.spectatorPlayers.length).toBe(1);
        expect(server.spectatorPlayers[0].playerId).toBe('1');
        expect(server.queuedPlayers.length).toBe(0);
        expect(server.inGamePlayers.length).toBe(0);
        expect(send.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    test('If autoStart then game starts when 2 players join', () => {
        (server.autoStart as any) = true;
        expect(server.serverState.gamePhase).toBe('pending');
        server.onConnect({ id: '1' } as any, {} as any);
        server.playerJoinGame('1');
        expect(server.serverState.gamePhase).toBe('pending');
        server.onConnect({ id: '2' } as any, {} as any);
        server.playerJoinGame('2');
        expect(server.serverState.gamePhase).toBe('active');
        expect(server.gameState).toBeTruthy();
    });

    test('If a player joins while game is active, they are queued', () => {
        server.onConnect({ id: '1' } as any, {} as any);
        server.playerJoinGame('1');
        server.onConnect({ id: '2' } as any, {} as any);
        server.playerJoinGame('2');
        server.onConnect({ id: '3' } as any, {} as any);
        server.playerJoinGame('3');
        expect(server.inGamePlayers.length).toBe(2);
        expect(server.queuedPlayers.length).toBe(1);
        expect(server.gameState).toBeTruthy();
        expect(server.gameState?.state.players.length).toBe(2);
        expect(server.queuedPlayers[0].playerId).toBe('3');
    });

    test('Queued players are added to the game when it end', () => {
        (server.autoStart as any) = false;
        server.onConnect({ id: '1' } as any, {} as any);
        server.playerJoinGame('1');
        server.onConnect({ id: '2' } as any, {} as any);
        server.playerJoinGame('2');
        server.startGame();
        server.onConnect({ id: '3' } as any, {} as any);
        server.playerJoinGame('3');
        expect(server.inGamePlayers.length).toBe(2);
        expect(server.queuedPlayers.length).toBe(1);
        expect(server.gameState?.state.players.length).toBe(2);
        server.endGame('system')

        expect(server.inGamePlayers.length).toBe(3);
        expect(server.queuedPlayers.length).toBe(0);
    });

    test('If autostart is on then restart game when it ends', () => {
        (server.autoStart as any) = true;
        server.onConnect({ id: '1' } as any, {} as any);
        server.playerJoinGame('1');
        server.onConnect({ id: '2' } as any, {} as any);
        server.playerJoinGame('2');
        server.startGame();
        server.endGame('fold');
        expect(server.serverState.gamePhase).toBe('active');
        expect(server.gameState).toBeTruthy();
    });

    test('If a player leaves while game is active with two players, end the game, give chips to remaining player', () => {
        server.onConnect({ id: '1' } as any, {} as any);
        server.playerJoinGame('1');
        server.onConnect({ id: '2' } as any, {} as any);
        server.playerJoinGame('2');
        server.startGame();
        server.onClose({ id: '1' } as any);
        expect(server.serverState.gamePhase).toBe('pending');
        expect(server.inGamePlayers.length).toBe(1);
        expect(server.inGamePlayers[0].playerId).toBe('2');
        expect(server.stacks['2']).toBe(1000 + server.gameConfig.bigBlind);
    });

    test('If a player leaves while game is active with more than two players, continue, that player folded', () => {
        (server.autoStart as any) = false;
        server.onConnect({ id: '1' } as any, {} as any);
        server.playerJoinGame('1');
        server.onConnect({ id: '2' } as any, {} as any);
        server.playerJoinGame('2');
        server.onConnect({ id: '3' } as any, {} as any);
        server.playerJoinGame('3');
        server.startGame();
        server.handlePlayerAction('3', { type: 'call' });
        server.handlePlayerAction('1', { type: 'call' });
        server.handlePlayerAction('2', { type: 'call' });
        server.onClose({ id: '2' } as any);
        expect(server.inGamePlayers.length).toBe(2);
        expect(server.gameState?.state.players.length).toBe(3);
        expect(server.gameState?.state.whoseTurn).toBe('3');
        expect(server.gameState?.state.players.find(p => p.id == '2')?.folded).toBeTruthy();

        expect(server.gameState?.state.whoseTurn).toBe('3');
        server.handlePlayerAction('3', { type: 'call' });
        expect(server.gameState?.state.whoseTurn).toBe('1');
        server.handlePlayerAction('1', { type: 'call' });
        expect(server.gameState?.state.whoseTurn).toBe('3');
    });

    test('Hand is null if player is not in game', () => {
        (server.autoStart as any) = false;
        server.onConnect({ id: '1' } as any, {} as any);
        server.playerJoinGame('1');
        server.onConnect({ id: '2' } as any, {} as any);
        server.playerJoinGame('2');
        server.onConnect({ id: '3' } as any, {} as any);
        server.startGame();

        expect(server.getStateMessage("1").hand?.length).toBe(2);
        expect(server.getStateMessage("2").hand?.length).toBe(2);
        expect(server.getStateMessage("3").hand).toBe(null);
    })
})
