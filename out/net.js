export var NetState;
(function (NetState) {
    NetState[NetState["Floating"] = 0] = "Floating";
    NetState[NetState["Low"] = 1] = "Low";
    NetState[NetState["High"] = 2] = "High";
    NetState[NetState["Error"] = 3] = "Error";
})(NetState || (NetState = {}));
export class Net {
    constructor(segments) {
        this.segments = segments;
        this.highlighted = false;
        this.state = NetState.Floating;
        this.nextState = NetState.Floating;
        segments.forEach(seg => seg.net = this);
    }
    static buildNets(segments) {
        const nets = [];
        const remainingSegments = new Set(segments);
        const visit = (seg, visited) => {
            if (visited.has(seg)) {
                return visited;
            }
            visited.add(seg);
            seg.switches
                .filter(sw => sw.state)
                .flatMap(sw => sw.segments)
                .forEach(seg => visit(seg, visited));
            return visited;
        };
        while (remainingSegments.size != 0) {
            const seed = remainingSegments.values().next().value;
            const segs = visit(seed, new Set());
            segs.forEach(s => remainingSegments.delete(s));
            const net = new Net(Array.from(segs));
            nets.push(net);
        }
        return nets;
    }
    drive(high) {
        const state = high ? NetState.High : NetState.Low;
        if (this.nextState === NetState.Floating) {
            this.nextState = state;
        }
        else if ((this.nextState === NetState.High ||
            this.nextState === NetState.Low) &&
            this.nextState !== state) {
            this.nextState = NetState.Error;
        }
    }
    simulationStart() {
        this.state = this.nextState = NetState.Floating;
    }
    update() {
        this.state = this.nextState;
        this.nextState = NetState.Floating;
    }
}
