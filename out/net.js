export class Net {
    constructor(segments) {
        this.segments = segments;
        this.highlighted = false;
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
            console.log(segs);
            segs.forEach(s => remainingSegments.delete(s));
            const net = new Net(Array.from(segs));
            nets.push(net);
        }
        return nets;
    }
}
