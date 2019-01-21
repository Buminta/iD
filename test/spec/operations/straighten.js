describe('iD.operationStraighten', function () {
    var fakeContext;
    var graph;

    // Set up the fake context
    fakeContext = {};
    fakeContext.graph = function () { return graph; };
    fakeContext.hasHiddenConnections = function () { return false; };

    describe('#available', function () {
        beforeEach(function () {
            // w1 - way with 2 nodes
            // w2 - way with 3 nodes connected to w1
            // w3 - way with 3 nodes connected to w2
            // w4 - way with 3 nodes not connected to other ways
            graph = iD.coreGraph([
                iD.osmNode({ id: 'n1', type: 'node' }),
                iD.osmNode({ id: 'n2', type: 'node' }),
                iD.osmNode({ id: 'n3', type: 'node' }),
                iD.osmNode({ id: 'n4', type: 'node' }),
                iD.osmNode({ id: 'n5', type: 'node' }),
                iD.osmNode({ id: 'n6', type: 'node' }),
                iD.osmNode({ id: 'n7', type: 'node' }),
                iD.osmNode({ id: 'n8', type: 'node' }),
                iD.osmNode({ id: 'n9', type: 'node' }),
                iD.osmNode({ id: 'n10', type: 'node' }),
                iD.osmWay({ id: 'w1', nodes: ['n1', 'n2'] }),
                iD.osmWay({ id: 'w2', nodes: ['n2', 'n3', 'n4'] }),
                iD.osmWay({ id: 'w3', nodes: ['n4', 'n5', 'n6'] }),
                iD.osmWay({ id: 'w4', nodes: ['n7', 'n8', 'n9'] }),
                iD.osmWay({ id: 'w5', nodes: ['n2', 'n10'] })
            ]);
        });

        it('is not available for no selected ids', function () {
            var result = iD.operationStraighten([], fakeContext.graph()).available();
            expect(result).to.be.not.ok;
        });

        it('is not available for way with only 2 nodes', function () {
            var result = iD.operationStraighten(['w1'], fakeContext.graph()).available();
            expect(result).to.be.not.ok;
        });

        it('is available for way with only 2 nodes connected to another 2-node way', function () {
            var result = iD.operationStraighten(['w1', 'w5'], fakeContext.graph()).available();
            expect(result).to.be.ok;
        });

        it('is not available for unknown selected id', function () {
            var result = iD.operationStraighten(['w0'], fakeContext.graph()).available();
            expect(result).to.be.not.ok;
        });

        it('is not available for non-continuous ways', function () {
            var result = iD.operationStraighten(['w3', 'w4'], fakeContext.graph()).available();
            expect(result).to.be.not.ok;
        });

        it('is available for selected way with more than 2 nodes', function () {
            var result = iD.operationStraighten(['w2'], fakeContext.graph()).available();
            expect(result).to.be.ok;
        });

        it('is available for selected, ordered, continuous ways', function () {
            var result = iD.operationStraighten(['w1', 'w2', 'w3'], fakeContext.graph()).available();
            expect(result).to.be.ok;
        });

        it('is available for selected, un-ordered, continuous ways', function () {
            var result = iD.operationStraighten(['w1', 'w3', 'w2'], fakeContext.graph()).available();
            expect(result).to.be.ok;
        });
    });
});
