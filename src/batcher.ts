
const reads = [];
const writes = [];

const options = {
    time: 1000 / 60,
    pending: false
};

const setup = function (options: any = {}) {
    this.options.time = options.time || this.options.time;
};

const tick = function (method: () => void) {
    return new Promise((resolve, reject) => {
        window.requestAnimationFrame(time => {
            Promise.resolve()
                .then(method.bind(this, time))
                .then(resolve)
                .catch(reject);
        });
    });
};

// schedules a new read/write batch if one is not pending
const schedule = async function () {
    if (this.options.pending) return;
    else this.options.pending = true;
    return this.tick(this.flush);
    // setTimeout(() => this.tick(this.flush).catch(console.error));
};

const flush = async function (time) {

    console.log('reads before:', this.reads.length);
    console.log('write before:', this.writes.length);

    let read;
    let reads = 0;
    while (read = this.reads.shift()) {
        if (read) await read();
        reads++;

        // if ((performance.now() - time) > this.options.time) {
        //     console.log('read max');
        //     return this.tick(this.flush);
        // }

    }

    let write;
    let writes = 0;
    while (write = this.writes.shift()) {
        if (write) await write();
        if (++writes === reads) break;

        // if ((performance.now() - time) > this.options.time) {
        //     console.log('write max');
        //     return this.tick(this.flush);
        // }

    }

    console.log('reads after:', this.reads.length);
    console.log('write after:', this.writes.length);

    if (this.reads.length === 0 && this.writes.length === 0) {
        this.options.pending = false;
    } else if ((performance.now() - time) > this.options.time) {
        return this.tick(this.flush);
    } else {
        return this.flush(time);
    }

};

const remove = function (tasks, task) {
    const index = tasks.indexOf(task);
    return !!~index && !!tasks.splice(index, 1);
};

const clear = function (task) {
    return this.remove(this.reads, task) || this.remove(this.writes, task);
};

const batch = function (read, write) {

    if (!read && !write) return;

    this.reads.push(read);
    this.writes.push(write);

    this.schedule().catch(console.error);
};

export default Object.freeze({
    reads,
    writes,
    options,
    setup,
    tick,
    schedule,
    flush,
    remove,
    clear,
    batch
});
