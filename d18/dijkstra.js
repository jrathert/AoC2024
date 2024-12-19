
// Dijkstra algorithm is used to find the shortest distance between two
// nodes inside a valid weighted graph.
// https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm

export class WeightedGraph {
    constructor() {
        // nodes maps a node (name) to a list of adjacent nodes and their weights (edge costs)
        this.nodes = {}
    }

    addEdge(v1, v2, weight = 1) {
        if (!this.nodes[v1]) this.nodes[v1] = []
        if (!this.nodes[v2]) this.nodes[v2] = []
        this.nodes[v1].push({ node: v2, weight })
        this.nodes[v2].push({ node: v1, weight })
    }

    removeEdge(v1, v2) {
        // ensure both nodes are in the nodelist
        if (this.nodes[v1] && this.nodes[v2]) {
            // they are bith there, now remove all edges between them
            // not super efficient, but works          
            let i1 = this.nodes[v1].findIndex(function (e) { return e.node == v2 })
            if (i1 != -1) this.nodes[v1].splice(i1, 1)
            let i2 = this.nodes[v2].findIndex(function (e) { return e.node == v1 })
            if (i2 != -1) this.nodes[v2].splice(i2, 1)
        }
    }

    // returns the shortest path from start to end 
    dijkstra(start, finish) {

        // build from end to start - will be reversed at the end
        let path = []   

        const pq = new PriorityQueue()
        const distances = {}
        const previous = {}
        let smallest = null

        // build up initial state of the pq
        for (let v in this.nodes) {
            if (v === start) {
                distances[v] = 0
                pq.enqueue(v, 0)
            } else {
                distances[v] = Infinity
                pq.enqueue(v, Infinity)
            }
            previous[v] = null
        }

        // now iterare the priority queue as long as there is something to visit
        while (pq.hasElements()) {

            smallest = pq.dequeue().val

            if (smallest === finish) {
                // done - build path and finish
                while (previous[smallest]) {
                    path.push(smallest)
                    smallest = previous[smallest]
                }
                break
            }

            // if there is a smallest element
            if (smallest || distances[smallest] !== Infinity) {
                for (let neigh in this.nodes[smallest]) {
                    // find neighboring node
                    let nextNode = this.nodes[smallest][neigh]
                    // calculate new distance to neighboring node
                    let candidate = distances[smallest] + nextNode.weight
                    let next = nextNode.node
                    if (candidate < distances[next]) {
                        // updating new smallest distance to neighbor
                        distances[next] = candidate
                        previous[next] = smallest
                        pq.enqueue(next, candidate)
                    }
                }
            }
        }
        return path.concat(smallest).reverse()
    }
}


// helper class for PriorityQueue
class _Node {
    constructor(val, priority) {
        this.val = val
        this.priority = priority
    }
}

class PriorityQueue {
    constructor() {
        this.values = []
    }
    
    hasElements() {
        return this.values.length > 0
    }

    isEmpty() {
        return this.values.length == 0
    }
    
    enqueue(val, priority) {
        let newNode = new _Node(val, priority)
        this.values.push(newNode)
        this._bubbleUp()
    }
    
    dequeue() {
        const min = this.values[0]
        const end = this.values.pop()
        if (this.values.length > 0) {
            this.values[0] = end
            this._sinkDown()
        }
        return min
    }

    _bubbleUp() {
        let idx = this.values.length - 1
        const el = this.values[idx]
        while (idx > 0) {
            let parentIdx = Math.floor((idx - 1) / 2)
            let parent = this.values[parentIdx]
            if (el.priority >= parent.priority) break
            this.values[parentIdx] = el
            this.values[idx] = parent
            idx = parentIdx
        }
    }

    _sinkDown() {
        let idx = 0
        const length = this.values.length
        const el = this.values[0]
        while (true) {
            let leftIdx = 2 * idx + 1
            let rightIdx = 2 * idx + 2
            let leftChild, rightChild
            let swap = null

            if (leftIdx < length) {
                leftChild = this.values[leftIdx]
                if (leftChild.priority < el.priority) {
                    swap = leftIdx
                }
            }
            if (rightIdx < length) {
                rightChild = this.values[rightIdx]
                if (
                    (swap === null && rightChild.priority < el.priority) ||
                    (swap !== null && rightChild.priority < leftChild.priority)
                ) {
                    swap = rightIdx
                }
            }
            if (swap === null) break
            this.values[idx] = this.values[swap]
            this.values[swap] = el
            idx = swap
        }
    }
}



//EXAMPLES=====================================================================

//   var graph = new WeightedGraph()
//   graph.addVertex("A")
//   graph.addVertex("B")
//   graph.addVertex("C")
//   graph.addVertex("D")
//   graph.addVertex("E")
//   graph.addVertex("F")

//   graph.addEdge("A", "B", 4)
//   graph.addEdge("A", "C", 2)
//   graph.addEdge("B", "E", 3)
//   graph.addEdge("C", "D", 2)
//   graph.addEdge("C", "F", 4)
//   graph.addEdge("D", "E", 3)
//   graph.addEdge("D", "F", 1)
//   graph.addEdge("E", "F", 1)

//   console.log(graph.dijkstra("A", "E"))