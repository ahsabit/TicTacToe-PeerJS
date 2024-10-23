import { useCallback, useEffect, useRef, useState } from 'react';
import { Peer } from "https://esm.sh/peerjs@1.5.4?bundle-deps";
import '../echo';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import InlineScoreBoard from '@/Components/InlineScoreBoard';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

export default function Playground({ user, game, isNew }) {
    const peerConnection = useRef(new Peer(undefined, {
        host: '/',
        port: 3003
    }));
    const matrix = useRef(Array(3).fill(null).map(() => Array(3).fill(null)));
    const canvasRef = useRef(null);
    const canvasContext = useRef(null);
    const isTurn = useRef(true);
    const thisPlayer = useRef(Math.random() > 0.5 ? true : false);
    const moveCount = useRef(0);
    const playerOneScore = useRef(0);
    const playerTwoScore = useRef(0);
    const [playerTwo, setPlayerTwo] = useState(game.data.player_two);
    const mainConn = useRef(null);
    useEffect(() => {
        user.data.playerSide = thisPlayer.current;
        canvasContext.current = canvasRef.current.getContext('2d');
        const verticies = [
                [[5, 5],   [300, 5]],
                [[5, 100], [300, 100]],
                [[5, 200], [300, 200]],
                [[5, 300], [300, 300]],
            ];

        verticies.forEach(vertice => {
                canvasContext.current.beginPath();
                canvasContext.current.moveTo(vertice[0][0], vertice[0][1]);
                canvasContext.current.lineTo(vertice[1][0], vertice[1][1]);
                canvasContext.current.stroke();

                canvasContext.current.beginPath();
                canvasContext.current.moveTo(vertice[0][1], vertice[0][0]);
                canvasContext.current.lineTo(vertice[1][1], vertice[1][0]);
                canvasContext.current.stroke();
        });

        window.Echo.private(`game.${game.data.id}`)
            .listen('InitiateGame', (e) => {
                console.log(e);
                if (e.player.isPlayerTwo == true && user.data.id != e.player.id) {
                    setPlayerTwo(e.player);
                } else {
                    setPlayerTwo(user.data);
                }
                thisPlayer.current = !e.player.playerSide;
                mainConn.current = peerConnection.current.connect(e.peerId);
        
                if (mainConn.current) {
                    console.log(mainConn, 'there');
                    // Handle incoming data
                    mainConn.current.on('data', (data) => {
                        console.log('data came');
                        data = JSON.parse(data);
                        console.log('Data received:', data);
                        try {
                            if (!thisPlayer.current) {
                                drawCross(data.a, data.b);
                            } else {
                                drawCircle(data.a, data.b);
                            }
                            isTurn.current = true;  // Allow the user to play after receiving data
                        } catch (error) {
                            console.error('Error handling data:', error);
                        }
                    });
    
                    canvasRef.current.addEventListener('click', (event) => {
                        if (!mainConn) {
                            console.error('No active connection');
                            return; // Exit if there's no connection
                        }
                    
                        var rect = canvasRef.current.getBoundingClientRect();
                        var x = Math.floor((event.clientX - rect.left) / 100);
                        var y = Math.floor((event.clientY - rect.top) / 100);
                    
                        if (isTurn.current) {  // Correctly access the 'current' property
                            mainConn.current.send(JSON.stringify({
                                a : x,
                                b: y
                            }));  // Send coordinates through the connection
                        
                            if (thisPlayer.current) {
                                drawCross(x, y);
                            } else {
                                drawCircle(x, y);
                            }
                            isTurn.current = false;  // Switch turn after sending
                            console.log('Move sent');
                        }
                    });
                
                    // Handle connection errors
                    mainConn.current.on('error', (err) => {
                        console.error('Connection error:', err);
                    });
                
                    // Handle connection close
                    mainConn.current.on('close', () => {
                        console.log('Connection closed');
                        mainConn.current = null;  // Clear the connection when it's closed
                    });
                }else{
                    console.log('error');
                }
            })
            .listen('EndGame', (e) => {
                console.log(e);
            });
        peerConnection.current.on('open', (id) => {
            var isSecond = false;
            if(game.data.player_two){
                isSecond = game.data.player_two.id == user.data.id;
            }
            user.data.isPlayerTwo = isSecond;
            if (!isNew) {
                window.axios.post('/start', {
                    gameId: game.data.id,
                    peerId: id,
                    player: user.data,
                }).then((e) => {
                    return;
                }).catch((err) => {
                    throw new Error(err);
                });
            }
        });
        peerConnection.current.on('data', () => console.log('data came to me'));

        // Handle peer connection
        peerConnection.current.on('connection', (conn) => {
            console.log('New connection established');
             // Assign the connection to the higher-scope variable
        
            if (mainConn.current = conn) {
                console.log(mainConn, 'there');
                // Handle incoming data
                mainConn.current.on('data', (data) => {
                    console.log('data came');
                    data = JSON.parse(data);
                    console.log('Data received:', data);
                    try {
                        if (!thisPlayer.current) {
                            drawCross(data.a, data.b);
                        } else {
                            drawCircle(data.a, data.b);
                        }
                        isTurn.current = true;  // Allow the user to play after receiving data
                    } catch (error) {
                        console.error('Error handling data:', error);
                    }
                });

                canvasRef.current.addEventListener('click', (event) => {
                    if (!mainConn) {
                        console.error('No active connection');
                        return; // Exit if there's no connection
                    }
                
                    var rect = canvasRef.current.getBoundingClientRect();
                    var x = Math.floor((event.clientX - rect.left) / 100);
                    var y = Math.floor((event.clientY - rect.top) / 100);
                
                    if (isTurn.current) {  // Correctly access the 'current' property
                        mainConn.current.send(JSON.stringify({
                            a : x,
                            b: y
                        }));  // Send coordinates through the connection
                    
                        if (thisPlayer.current) {
                            drawCross(x, y);
                        } else {
                            drawCircle(x, y);
                        }
                        isTurn.current = false;  // Switch turn after sending
                        console.log('Move sent');
                    }
                });
            
                // Handle connection errors
                mainConn.current.on('error', (err) => {
                    console.error('Connection error:', err);
                });
            
                // Handle connection close
                mainConn.current.on('close', () => {
                    console.log('Connection closed');
                    mainConn.current = null;  // Clear the connection when it's closed
                });
            }else{
                console.log('error');
            }
        });

    }, []);

    const drawCross = (xPos, yPos) => {
        if (matrix.current[xPos][yPos] != null) {
            return;
        }

        var crossVertices = [];
        var baseX = xPos * 100 + 15;
        var baseY = yPos * 100 + 15;
        
        crossVertices = [
            [[baseX, baseY], [baseX + 75, baseY + 75]],
            [[baseX + 75, baseY], [baseX, baseY + 75]] 
        ];
        

        crossVertices.forEach(cross => {
            canvasContext.current.beginPath();
            canvasContext.current.moveTo(cross[0][0], cross[0][1]);
            canvasContext.current.lineTo(cross[1][0], cross[1][1]);
            canvasContext.current.stroke();
        });
        matrix.current[xPos][yPos] = 1;
        setTimeout(() => {
            checkWin(1);
        }, 10);
    };

    const drawCircle = (xPos, yPos) => {
        if (matrix.current[xPos][yPos] != null) {
            return;
        }
        const baseX = (xPos * 100) + 52.5;
        const baseY = (yPos * 100) + 52.5;
        canvasContext.current.beginPath();
        canvasContext.current.arc(baseX, baseY, 30, 0, 2 * Math.PI);
        canvasContext.current.stroke();
        matrix.current[xPos][yPos] = 0;
        setTimeout(() => {
            checkWin(0);
        }, 10)
    };

    const checkWin = (player) => {
        const size = 3; // Assuming a 3x3 Tic-Tac-Toe board
        let win = false;
    
        let rowWin, colWin;
        let diag1Win = true; // Left-to-right diagonal
        let diag2Win = true; // Right-to-left diagonal
    
        for (let i = 0; i < size; i++) {
            rowWin = true;
            colWin = true;
    
            for (let j = 0; j < size; j++) {
                // Check row
                if (matrix.current[i][j] !== player) {
                    rowWin = false;
                }
                // Check column
                if (matrix.current[j][i] !== player) {
                    colWin = false;
                }
            }
    
            // If a row or column is fully occupied by the player, declare a win
            if (rowWin || colWin) {
                win = true;
                break;
            }
    
            // Check diagonals
            if (matrix.current[i][i] !== player) {
                diag1Win = false;
            }
            if (matrix.current[i][size - i - 1] !== player) {
                diag2Win = false;
            }
        }
    
        // Check diagonal wins
        if (diag1Win || diag2Win) {
            win = true;
        }
        
        moveCount.current++;
    
        if (win) {
            alert(player + ' won');
            return;
        }
        if (moveCount.current == 9){
            alert('it is a draw');
        }
    };

    return(
        <div className='w-screen h-screen bg-gray-300 pt-4'>
            <Head title='Tic Tac Toe'/>
            <div className='mx-auto w-[358px] h-[406px] shadow-2xl rounded-2xl p-6 bg-gray-100'>
                <h1 className='w-full text-center font-bold text-2xl mb-4'>Tic Tac Toe</h1>
                <canvas width={310} height={310} ref={canvasRef}></canvas>
            </div>
            <div className='mx-auto w-[358px] h-16 overflow-hidden flex flex-row justify-between py-4'>
                <div className='bg-gray-100 h-full w-fit flex justify-center items-center px-4 rounded'>
                    <span className='block font-bold'>Player One: {isNew ? user.data.name : game.data.player_one.name}</span>
                </div>
                <div className='bg-gray-100 h-full w-fit flex justify-center items-center px-4 rounded'>
                    <span className='block font-bold'>Player Two: {playerTwo == null ? 'loading' : playerTwo.name}</span>
                </div>
            </div>
            <InlineScoreBoard playerOneScore={playerOneScore.current} playerTwoScore={playerTwoScore.current} />
        </div>
    )
};