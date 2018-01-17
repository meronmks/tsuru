// @flow
import {eventChannel, END} from 'redux-saga';
import {take, fork, select, put, call} from 'redux-saga/effects';

import * as Services from '../../core/Services';
import * as types from '../constant';
import alloc from '../../core/value/allocation';
import {streamingActions, contentActions} from "../action";
import {streaming} from "../../core/constant/dataType";

const {remote} = window.require('electron');
const request = remote.require('request');
const StringDecoder = remote.require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');
const Buffer = remote.require('safe-buffer').Buffer;

let data = new Buffer('');

function receiver(emitter: Function, service: string, accountIndex: number, target: Object) {
    try{
        emitter(contentActions.updateContent({
            accountIndex,
            datatype: 'home',
            data: alloc(service, streaming, JSON.parse(decoder.write(target)))
        }))
    }catch(e){
        throw e;
    }
}

function subscribe(stream: any, service: string, accountIndex: number): any {
    return eventChannel(emit => {
        stream.once('data', () => {
            console.log('Streaming APIに接続しました。');
            emit(streamingActions.setStreamingStatus({
                isStreaming: true,
                accountIndex
            }))
        });

        stream.on('data', (chunk) => {
            try{
                receiver(emit, service, accountIndex, chunk);
            }catch(e){
                data += chunk;
                try{
                    receiver(emit, service, accountIndex, data);
                    data = new Buffer('');
                }catch(e){
                    // くぁｗせｄｒｆｔｇｙふじこｌｐ；「’
                }
            }
        });

        stream.on('end', () => {
            console.log('Streaming APIから切断されました。');
            emit(streamingActions.setStreamingStatus({
                isStreaming: false,
                accountIndex
            }));
            emit(END);
        });

        stream.on('close', (err) => {
            console.log('Streaming APIから切断されました。');
            console.warn(err);
            emit(streamingActions.setStreamingStatus({
                isStreaming: false,
                accountIndex
            }));
            emit(END);
        });
        return () => {};
    });
}

function* streamingProcess(target: Object): any {
    try{
        const channel = yield call(subscribe, request.get({url: target.url, oauth: target.key}), target.service, target.accountIndex);
        while(true){
            const action = yield take(channel);
            yield put(action);
        }
    } catch(e) {
        throw e;
    }
}

export default function* connectStreaming(action: Object): any {
    const {accountIndex, apidata} = action.payload;
    try{
        console.log('start streaming...');
        const target = yield select((state: Object): Object => {
            const account = state.account[accountIndex].account;
            const url = account.service === Services.Twitter ? apidata.url : (account.client.url + apidata.url);
            return {
                url,
                key: {
                    consumer_key: account.client.consumerKey,
                    consumer_secret: account.client.consumerSecret,
                    token: account.client.accessToken,
                    token_secret: account.client.accessTokenSecret,
                },
                accountIndex,
                service: apidata.service,
                datatype: apidata.datatype
            };
        });
        yield fork(streamingProcess, target);
    } catch (e) {
        throw e;
    }
};