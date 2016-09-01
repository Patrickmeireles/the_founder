import _ from 'underscore';
import Tile from '../Tile';
import Grid from '../Grid';

const Evaluation = {
  tileValue: function(tile) {
    if (tile instanceof Tile.Income) {
      return 3 * tile.income;
    } else if (tile instanceof Tile.Influencer) {
      return 4;
    } else {
      return 0;
    }
  },

  // value of a piece given a tile
  pieceValue: function(piece, tile) {
    // the stronger & closer, the more valuable
    var distanceValue = 1/(Grid.manhattanDistance(piece.position, tile.position) + 1e-12),
        healthValue = piece.health;
    return distanceValue * healthValue;
  },

  // the value of attacking an enemy,
  // given a tile to defend and an attacker
  attackValue: function(attacker, enemy, tile) {
    var enemy = _.clone(enemy),
        threat = Evaluation.tileThreat(enemy, tile);

    // simulate enemy damage
    enemy.health -= attacker.health/2;
    var expectedHealth = attacker.health - enemy.health/2,
        expectedThreatAfter = Evaluation.tileThreat(enemy, tile);

    // reducing bigger threats by a lot is more valuable,
    // but we don't want attackers going on suicide missions
    return (threat + expectedHealth)/(Math.sqrt(expectedThreatAfter) + 1e-12);
  },

  tileThreat: function(piece, tile) {
    // stronger and closer pieces are more threatening
    return piece.health/(Grid.manhattanDistance(piece.position, tile.position) + 1e-12);
  },

  tileThreats: function(grid, tile, owner) {
    var nearbyTiles = grid.tilesInRange(tile.position, 2);
    var threat = _.reduce(nearbyTiles, function(m,t) {
      if (t.piece && t.piece.owner != owner) {
        return m + Evaluation.tileThreat(t.piece, tile);
      }
      return m;
    }, 0);
    return threat;
  }
};

export default Evaluation;
