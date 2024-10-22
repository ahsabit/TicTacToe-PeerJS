import { useEffect, useRef } from 'react';
import { Peer } from "https://esm.sh/peerjs@1.5.4?bundle-deps";
import '../echo';
import axios from 'axios';
import { Head } from '@inertiajs/react';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

export default function Playground({ user, game, isNew }) {
    const peerConnection = useRef(new Peer(undefined, {
        host: '/',
        port: 3003
    }));
    const matrix = useRef([]);
    const conn = useRef(null);
    const canvasRef = useRef(null);
    const canvasContext = useRef(null);
    const isX = useRef(Math.random() >= 0.5);
    useEffect(() => {
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
                conn.current = peerConnection.current.connect(e.peerId);
            })
            .listen('EndGame', (e) => {
                console.log(e);
            });
        peerConnection.current.on('open', (id) => {
            if (!isNew) {
                axios.post('/start', {
                    gameId: game.data.id,
                    peerId: id
                }).then((e) => {
                    console.log(e);
                }).catch((err) => {
                    throw new Error(err);
                });
            }
        });
        peerConnection.current.on('connection', (secondconn) => {
            conn.current = secondconn;
            secondconn.on('data', (data) => {
                console.log(data);
            });
            console.log('connected')
        });
        canvasRef.current.addEventListener('click', (event) => {
            var rect = canvasRef.current.getBoundingClientRect();
            var x = Math.floor((event.clientX - rect.left) / 100);
            var y = Math.floor((event.clientY - rect.top) / 100);
            if (isX.current) {
                drawCross(x, y);
                isX.current = false;
            }else{
                drawCircle(x, y);
                isX.current = true;
            }
        });
    }, []);

    const drawCross = (xPos, yPos) => {
        if (!matrix.current[xPos]) {
            matrix.current[xPos] = [];
        }
        if (typeof matrix.current[xPos][yPos] != 'undefined') {
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
    };

    const drawCircle = (xPos, yPos) => {
        if (!matrix.current[xPos]) {
            matrix.current[xPos] = [];
        }
        if (typeof matrix.current[xPos][yPos] != 'undefined') {
            return;
        }
        const baseX = (xPos * 100) + 52.5;
        const baseY = (yPos * 100) + 52.5;
        canvasContext.current.beginPath();
        canvasContext.current.arc(baseX, baseY, 30, 0, 2 * Math.PI);
        canvasContext.current.stroke();
        matrix.current[xPos][yPos] = 0;
    };

    return(
        <>
            <Head title='Tic Tac Toe'/>
            <canvas className='bg-sky-500' width={310} height={310} ref={canvasRef}></canvas>
        </>
    )
};