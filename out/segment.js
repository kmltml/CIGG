export class Segment {
    constructor() {
        this.switches = [];
        this.points = [];
    }
    isActive() {
        return this.switches.some(sw => sw.state && sw.shape !== "diamond");
    }
    draw(ctxt) {
        let activePoints = this.points.filter(p => {
            if (p.state === undefined) {
                return true;
            }
            if (p.state) {
                if (p.shape !== "diamond") {
                    return true;
                }
                else {
                    return p.activeFor(this);
                }
            }
        });
        if (activePoints.length <= 1) {
            ctxt.strokeStyle = "rgba(0, 0, 0, 0.15)";
            activePoints = this.points;
        }
        else {
            ctxt.strokeStyle = "rgba(0, 0, 0, 1.0)";
        }
        ctxt.beginPath();
        ctxt.moveTo(activePoints[0].x, activePoints[0].y);
        for (let i = 1; i < activePoints.length; i++) {
            ctxt.lineTo(activePoints[i].x, activePoints[i].y);
        }
        ctxt.stroke();
        ctxt.strokeStyle = "black";
    }
    addSwitch(sw) {
        if (this.switches.includes(sw)) {
            return;
        }
        this.switches.push(sw);
        this.points.push(sw);
        this.resortPoints();
    }
    resortPoints() {
        if (this.points.length <= 1) {
            return;
        }
        this.points.sort((a, b) => (a.x == b.x) ? a.y - b.y : a.x - b.x);
    }
}
