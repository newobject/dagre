require("../common");

describe("dagre.layout", function() {
  it("sets order = 0 for a single node", function() {
    var g = dagre.dot.toGraph("digraph { A [rank=0] }");

    dagre.layout.order().run(g, dagre.graph());

    assert.equal(g.node("A").order, 0);
  });

  it("sets order = 0 for 2 connected nodes on different ranks", function() {
    var g = dagre.dot.toGraph("digraph { A [rank=0]; B [rank=1]; A -> B }");

    dagre.layout.order().run(g, dagre.graph());

    assert.equal(g.node("A").order, 0);
    assert.equal(g.node("B").order, 0);
  });

  it("sets order = 0 for 2 unconnected nodes on different ranks", function() {
    var g = dagre.dot.toGraph("digraph { A [rank=0]; B [rank=1]; }");

    dagre.layout.order().run(g, dagre.graph());

    assert.equal(g.node("A").order, 0);
    assert.equal(g.node("B").order, 0);
  });

  it("sets order = 0, 1 for 2 nodes on the same rank", function() {
    var g = dagre.dot.toGraph("digraph { A [rank=0]; B [rank=0]; }");

    dagre.layout.order().run(g, dagre.graph());

    if (g.node("A").order === 0) {
      assert.equal(g.node("B").order, 1);
    } else {
      assert.equal(g.node("A").order, 1);
      assert.equal(g.node("B").order, 0);
    }
  });

  it("finds minimal crossings", function() {
    var str = "digraph { A [rank=0]; B [rank=0]; C [rank=0]; D [rank=1]; E [rank=1]; " +
                "A -> D; B -> D; B -> E; C -> D; C -> E }";
    var g = dagre.dot.toGraph(str);

    var layering = dagre.layout.order().run(g, dagre.graph());

    assert.equal(dagre.layout.order.crossCount(g, layering), 1);
  });

  it("supports constraints that may produce more crossings", function() {
    var g = dagre.dot.toGraph("digraph { A [rank=0]; B [rank=0]; C [rank=0]; D [rank=1]; E [rank=1]; " +
                                  "A -> D; B -> D; B -> E; C -> D; C -> E }");
    var cg = dagre.dot.toGraph("digraph { E -> D }");

    var layering = dagre.layout.order().run(g, cg);

    assert.equal(g.node("E").order, 0);
    assert.equal(g.node("D").order, 1);
  });
});

describe("dagre.layout.bilayerCrossCount", function() {
  it("calculates 0 crossings for an empty graph", function() {
    var g = dagre.dot.toGraph("digraph {}");
    var layer1 = [];
    var layer2 = [];

    assert.equal(dagre.layout.order.bilayerCrossCount(g, layer1, layer2), 0);
  });

  it("calculates 0 crossings for 2 layers with no crossings", function() {
    var g = dagre.dot.toGraph("digraph {11 -> 21; 12 -> 22; 13 -> 23}");
    var layer1 = [11, 12, 13];
    var layer2 = [21, 22, 23];

    assert.equal(dagre.layout.order.bilayerCrossCount(g, layer1, layer2), 0);
  });

  it("calculates the correct number of crossings 1", function() {
    // Here we have 12 -> 22 crossing 13 -> 21
    var g = dagre.dot.toGraph("digraph {11 -> 21; 12 -> 21; 12 -> 22; 13 -> 21; 13 -> 22}");
    var layer1 = [11, 12, 13];
    var layer2 = [21, 22];

    assert.equal(dagre.layout.order.bilayerCrossCount(g, layer1, layer2), 1);
  });

  it("calculates the correct number of crossings 2", function() {
    // Here we have 11 -> 22 crossing 12 -> 21 and 13 -> 21, and we have 12 -> 22 crossing 13 -> 21
    var g = dagre.dot.toGraph("digraph {11 -> 22; 12 -> 21; 12 -> 22; 13 -> 21; 13 -> 22}");
    var layer1 = [11, 12, 13];
    var layer2 = [21, 22];

    assert.equal(dagre.layout.order.bilayerCrossCount(g, layer1, layer2), 3);
  });
});
