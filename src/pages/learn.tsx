import Main from '@app/layouts/main'
import React from 'react'

export default function Learn() {
  return (
    <Main>
      <div style={{ padding: 20 }}>
        <h1>Basic Poker Rules</h1>
        <div className="rules-section">
          <h2>Overview</h2>
          <p>Poker is a popular card game that combines skill, strategy, and luck. Players wager over which hand is best according to the game's rules. Here we explain the rules for a standard game of Texas Hold'em, one of the most widely played versions of poker.</p>
        </div>

        <div className="rules-section">
          <h2>Basic Rules</h2>
          <ol>
            <li><strong>The Deal:</strong> Each player is dealt two private cards (known as 'hole cards') that belong to them alone. Five community cards are dealt face-up on the 'board'. All players in the game use these shared community cards in conjunction with their own hole cards to each make their best possible five-card hand.</li>
            <li><strong>The Betting Rounds:</strong> There are four rounds of betting:
              <ul>
                <li><strong>Pre-flop:</strong> After receiving their hole cards, players bet based on the strength of their cards.</li>
                <li><strong>The Flop:</strong> The first three community cards are dealt face-up.</li>
                <li><strong>The Turn:</strong> The fourth community card is dealt face-up.</li>
                <li><strong>The River:</strong> The fifth and final community card is dealt face-up.</li>
              </ul>
            </li>
            <li><strong>The Showdown:</strong> If more than one player remains after the final betting round, the players reveal their cards, and the player with the best hand wins the pot.</li>
          </ol>
        </div>

        <div className="rules-section card-rankings">
          <h2>Hand Rankings</h2>
          <ul>
            <li><strong>Royal Flush:</strong> A, K, Q, J, 10, all of the same suit.</li>
            <li><strong>Straight Flush:</strong> Five consecutive cards of the same suit.</li>
            <li><strong>Four of a Kind:</strong> Four cards of the same rank.</li>
            <li><strong>Full House:</strong> Three cards of one rank and two cards of another rank.</li>
            <li><strong>Flush:</strong> Any five cards of the same suit, but not in sequence.</li>
            <li><strong>Straight:</strong> Five consecutive cards of different suits.</li>
            <li><strong>Three of a Kind:</strong> Three cards of the same rank.</li>
            <li><strong>Two Pair:</strong> Two cards of one rank and two cards of another rank.</li>
            <li><strong>One Pair:</strong> Two cards of the same rank.</li>
            <li><strong>High Card:</strong> Any hand that does not qualify under the categories listed above.</li>
          </ul>
        </div>

        <div className="rules-section">
          <h2>Betting Options</h2>
          <ul>
            <li><strong>Check:</strong> Decline to bet, but keep your cards.</li>
            <li><strong>Bet:</strong> Place an initial wager.</li>
            <li><strong>Call:</strong> Match the current bet made by another player.</li>
            <li><strong>Raise:</strong> Increase the current bet.</li>
            <li><strong>Fold:</strong> Discard your cards and forfeit the round.</li>
          </ul>
        </div>

        <div className="rules-section">
          <h2>Winning the Game</h2>
          <p>The game continues until one player has won all of the chips, or until the players decide to end the game. In a tournament setting, the last player remaining with chips is the winner.</p>
        </div>
      </div >
      <style>{`#root{overflow:auto!important`}</style>
    </Main>
  )
}