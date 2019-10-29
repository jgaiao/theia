/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { CancellationToken, cancelled } from './cancellation';

/**
 * Simple implementation of the deferred pattern.
 * An object that exposes a promise and functions to resolve and reject it.
 */
export class Deferred<T> {
    resolve: (value?: T) => void;
    reject: (err?: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any

    promise = new Promise<T>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}

/**
 * @returns resolves after a specified number of milliseconds
 * @throws cancelled if a given token is cancelled before a specified number of milliseconds
 */
export function timeout(ms: number, token = CancellationToken.None): Promise<void> {
    const deferred = new Deferred<void>();
    const handle = setTimeout(() => deferred.resolve(), ms);
    token.onCancellationRequested(() => {
        clearTimeout(handle);
        deferred.reject(cancelled());
    });
    return deferred.promise;
}

/**
 * Wrap a promise to know synchronously if it is finished or not.
 */
export class PromiseTask<T> {

    /** Promise that will resolve when finished. */
    readonly promise: Promise<T>;

    finished = false;

    constructor(promise: Promise<T>) {
        this.promise = promise.then(value => {
            this.finished = true;
            return value;
        }, error => {
            this.finished = true;
            throw error;
        });
    }

}
