# Socket.io Events / HTTP endpoints Reference

### Client -> Server

- registerUser
   - Description: adding user to the room, sending playerJoined event.
   - Type: RegisterUserData
   - Callback: None
- playerReady:
   - Description: sets player state to ready, if all other players are ready, starts the game
   - Type: number
   - Callback: None
- playerUnReady:
   - Description: sets player state back to not ready.
   - Type: number
   - Callback: None
- playerInputs:
   - Description: sends what buttons player is pressing and cursor position
   - Type: PlayerInputs
   - Callback: None

### Server -> Client

- somethingBroke:
   - Description: generalized error response
   - Type: SomethingBrokeData
- tick:
   - Decsripton: sending current game state to all users in the group
   - Type: ServerData
- changeLevel
   - sends id (name) of the new level
   - Type: string | undefined
- playerJoined
   - sends the name, id and color of user that joined
   - Type: PlayerJoinedData
- playerLeft
   - sends the name of user that left
   - Type: number
- levelReloaded
   - sends nothing, it is just an infromation for frontend to also reaload the scene
   - Type: None

### HTTP Endpoints

- /api/ping:
   - Description: Pong
   - Type: {pong: true}

- /api/createRoom:
   - Description: Creates a room (CRAZY)
   - Type: {roomID: string, userID: number}

- /api/joinRoom/:id:
   - Description: Joins user to a room of :id.
   - Type: {roomID: string, userID: number}
