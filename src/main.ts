import { Grid } from "./grid"
import { Interconnect } from "./interconnect"
import { LogicBlock } from "./logic_block"
import { Wires } from "./wires"
import { Switch } from "./switch"
import { Segment } from "./segment"
import { InterfaceDriver, LutDriver } from "./block_driver"
import { Net } from "./net"
import { SimulationState } from "./simulation_state"

document.addEventListener('DOMContentLoaded', () => {

  const canvas = <HTMLCanvasElement> document.getElementById('main-canvas')
  const ctxt = canvas.getContext('2d')!

  const grid = new Grid(7, 7)
  for (let x = 0; x < grid.width; x++) {
    for (let y = 0; y < grid.width; y++) {
      if (x === 0 || y === 0 || x === grid.width - 1 || y === grid.height - 1) {
        if (((x === 0 || x === grid.width - 1) && y % 2 === 0) !== ((y === 0 || y === grid.height - 1) && x % 2 === 0)) {
          grid.cells[x][y] = new LogicBlock(x, y, new InterfaceDriver())
        }
      } else  if (x % 2 == 1 && y % 2 == 1) {
        grid.cells[x][y] = new Interconnect(x, y)
      } else if (x % 2 == 0 && y % 2 == 0) {
        grid.cells[x][y] = new LogicBlock(x, y, new LutDriver())
      } else {
        grid.cells[x][y] = new Wires(x, y, 3)
      }
    }
  }

  ;(window as any).grid = grid
  ;(window as any).ctxt = ctxt

  grid.foreach(cell => cell.initSegments(grid))
  grid.foreach(cell => cell.initSwitches(grid))

  const switches: Switch[] = []
  const segments: Segment[] = []

  let highlightedNet: Net | undefined = undefined
  ;(window as any).switches = switches
  grid.foreach(cell => {
    switches.push(...cell.switches)
    segments.push(...cell.segments)
  })

  let nets = Net.buildNets(segments)
  let simstate = new SimulationState()

  function redraw() {
    ctxt.resetTransform()
    ctxt.clearRect(0, 0, canvas.width, canvas.height)

    ctxt.translate(100, 100)
    switches.forEach(s => {
      if ((s.state && s.shape !== "diamond") || !simstate.running) {
        s.draw(ctxt)
      }
    })
    switches.forEach(s => s.clearActive())
    switches.forEach(s => s.updateActive())
    segments.forEach(s => s.draw(ctxt, simstate))
    grid.foreach(cell => cell.draw(ctxt))
  }

  redraw()

  canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left - 100
    const y = e.clientY - rect.top - 100

    for (let seg of segments) {
      if (seg.bounds.containsPoint(x, y)) {
        if (seg.net !== highlightedNet) {
          if (highlightedNet !== undefined) {
            highlightedNet.highlighted = false
          }
          highlightedNet = seg.net
          if (highlightedNet !== undefined) {
            highlightedNet.highlighted = true
          }
          redraw()
        }
        return
      }
    }

    if (highlightedNet !== undefined) {
      highlightedNet.highlighted = false
      highlightedNet = undefined
      redraw()
    }
  })

  canvas.addEventListener("mousedown", e => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left - 100
    const y = e.clientY - rect.top - 100

    grid.foreach(cell => {
      if (cell instanceof LogicBlock && cell.bounds.containsPoint(x, y)) {
        if (cell.driver instanceof InterfaceDriver) {
          cell.driver.state = !cell.driver.state
        }
      }
    })

    for (let sw of switches) {
      if (sw.bounds.containsPoint(x, y)) {
        sw.state = !sw.state
        ;(window as any).lastSwitch = sw
        nets = Net.buildNets(segments)
        redraw()
      }
    }
  })

  document.addEventListener("keydown", e => {
    if (e.key === " ") {
      simstate.running = !simstate.running
      nets.forEach(net => net.simulationStart())
      redraw()
    } else if (simstate.running && e.key === "s") {
      grid.foreach(cell => {
        if (cell instanceof LogicBlock) {
          cell.update()
        }
      })
      nets.forEach(net => net.update())
      redraw()
    }
  })

})
