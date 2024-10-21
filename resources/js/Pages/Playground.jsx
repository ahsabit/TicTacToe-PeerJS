import { useEffect, useRef } from 'react';
import { Peer } from "https://esm.sh/peerjs@1.5.4?bundle-deps";
import '../echo';
import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

export default function Playground({ user, game, isNew }) {
    const peerConnection = useRef(new Peer(undefined, {
        host: '/',
        port: '3003'
    }));
    const conn = useRef(null);
    useEffect(() => {
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
    }, []);
    //
    return(
        <p>hello</p>
    )
};