const crypto = require('crypto');

// Kalit yaratish sinfi
class KeyGenerator {
  static generateKey() {
    return crypto.randomBytes(32).toString('hex'); // 256 bit (32 byte)
  }
}

// HMAC yaratish sinfi
class HMACGenerator {
  static createHMAC(key, message) {
    return crypto.createHmac('sha256', key).update(message).digest('hex');
  }
}

// O'yin qoidalari sinfi
class GameRules {
  constructor(moves) {
    this.moves = moves;
    this.moveCount = moves.length;
  }

  // Foydalanuvchi va kompyuter harakati qiyoslaydi
  getResult(userMove, computerMove) {
    if (userMove === computerMove) return 'Draw';
    
    const half = Math.floor(this.moveCount / 2);
    const userIndex = this.moves.indexOf(userMove);
    const computerIndex = this.moves.indexOf(computerMove);
    
    // Harakatlar ketma-ketlikda joylashgan
    if ((computerIndex > userIndex && computerIndex <= userIndex + half) ||
        (computerIndex < userIndex && computerIndex + this.moveCount <= userIndex + half)) {
      return 'You lose!';
    }
    return 'You win!';
  }
}

// Yordam jadvali sinfi
class HelpTable {
  constructor(moves) {
    this.moves = moves;
    this.rules = new GameRules(moves);
  }

  generateTable() {
    const header = [' ', ...this.moves];
    const rows = this.moves.map((move, i) => {
      const row = [move];
      for (let j = 0; j < this.moves.length; j++) {
        if (i === j) {
          row.push('Draw');
        } else {
          const result = this.rules.getResult(this.moves[i], this.moves[j]);
          row.push(result === 'You win!' ? 'Win' : 'Lose');
        }
      }
      return row;
    });

    console.table([header, ...rows]);
  }
}

// Tasodifiy harakat yaratish
function getRandomMove(moves) {
  const index = Math.floor(Math.random() * moves.length);
  return moves[index];
}

// Asosiy o'yin jarayoni
function playGame(moves) {
  if (moves.length < 3 || moves.length % 2 === 0 || new Set(moves).size !== moves.length) {
    console.log('Error: Invalid number of moves or repeated moves. Example usage: node index.js rock paper scissors');
    return;
  }

  const key = KeyGenerator.generateKey();
  const computerMove = getRandomMove(moves);
  const hmac = HMACGenerator.createHMAC(key, computerMove);

  console.log(`HMAC: ${hmac}`);
  console.log('Available moves:');
  moves.forEach((move, index) => {
    console.log(`${index + 1} - ${move}`);
  });
  console.log('0 - exit');
  console.log('? - help');

  process.stdin.on('data', (data) => {
    const input = data.toString().trim();

    if (input === '0') {
      console.log('Exiting...');
      process.exit();
    } else if (input === '?') {
      const helpTable = new HelpTable(moves);
      helpTable.generateTable();
    } else {
      const userMoveIndex = parseInt(input, 10) - 1;
      if (userMoveIndex >= 0 && userMoveIndex < moves.length) {
        const userMove = moves[userMoveIndex];
        console.log(`Your move: ${userMove}`);
        console.log(`Computer move: ${computerMove}`);

        const rules = new GameRules(moves);
        const result = rules.getResult(userMove, computerMove);
        console.log(result);
        console.log(`HMAC key: ${key}`);
        process.exit();
      } else {
        console.log('Invalid move. Please try again.');
      }
    }
  });
}


const moves = process.argv.slice(2);
playGame(moves);
