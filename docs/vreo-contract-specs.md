Token Contract
===========

The token contract implements a ERC20 standard token. It is named MERO Token.
Ticker symbol will be MERO. 
The number of decimals will be 18 to keep the MERO resolution identical to ETH.

The token contract emits the standard ERC20 events including a transfer
event to address 0x0 in case of issued tokens.

We rely on the broadly trusted Open Zeppelin implementation of an
ERC20 compliant Token. The following extensions are used:

Capped and Mintable
-------------------

Tokens are minted on demand by the owner of the token contract.
Therefore the ownership of the token contract has to be transferred to
the token sale contract. The minting of tokens is capped at 700,000,000.

Pausable
--------

Transfer of tokens is paused on construction of the token contract.
Transfer of tokens is unpaused on finalization of the token sale
contract. No transfer of tokens is possible during the ICO.

Owned
-----

Minting and pausing functions are restricted to the token contract
owner. The ownership of the token contract is transferred to the token
sale contract immediately after deploy.

Burnable
--------

Token can be irreversibly burned (destroyed) by the token holder at any
time.

Token Sale Contract
===================


Post KYC crowd sale
-------------------

The token sale contract implements a new scheme for KYC verification. Everybody is able to invest ETH into the crowd sale but tokens are only minted after the KYC of the sending address is verified. 
If an unverified investor sends ETH, tokens are not minted but the amount of pending tokens will be stored and issued when the address is verified by the owner of the token sale contract. 
The verification should process multiple addresses in one transaction.
Once an address is verified it can invest and the token purchase will be processed instantly. Investors who send ETH and do not provide KYC information or investors that do not meet KYC requirements, can withdraw their investment after the end of the token sale. 

Bounty contract
---------------

The Bounty tokens will be minted to the bounty contract during finalization. The owner the bounty contract can distribute tokens. The bounty contract works like an airdrop. The owner send a list of addresses and amounts to the bounty contract, which transfers the tokens to each bounty recipient.


Set Rate
--------

The token sale contract provides a function that enables the token
contract owner to set the MERO Token price at any time. The
price represents the MERO per ETH rate. With a target
price of $0.05$ € per MERO we will have a rate of
approximately 9,000$ according to a price of approximately € per ETH.


Tokens are minted by the token sale contract.

  Pool                   Cap               distribution time
  ---------- ----- ------------- ---------------------------------------
  priv. Presale      no cap       any time before end of Vreo sale
  ICONIQ sale	     no cap       between start and end date of ICONIQ sale
  Vreo sale          no cap       between start and end date of Vreo sale
  total sale         450,000,000  before end of VREO sale
  Bounty              50,000,000             at finalization
  Team                85,000,000             at finalization
  Legals              57,000,000             at finalization
  Advisors            58,000,000             at finalization
  Token Cap          700,000,000 

The token sale consists of the two stages ICONIQ sale and VREO sale




Presale
-------

At any time before the end of the VREO sale, tokens can be issued issued 
to private presale investors by the owner of the token sale contract. The token sale contract can process a list containing the amounts of tokens assigned to presale buyer addresses. 

ICONIQ sale
-----------

There will be a presale period exclusively accessible by ICONIQ-Token holders. The amount of ETH an address can send is dependent on the amount of ICONIQ token it holds sat the time of investment. 
Investors 

VREO sale
---------

The VREO sale has 3 phases. In the first phase there will be a bonus of 20 % in second phase there will be a bonus of 10 %,  in the third phase there will be no bonus.

Finalization
------------

After end of end of the KYC verification period the finalization stage
takes place. Legals tokens will be minted to legals wallet. Advisor  tokens will be minted to advisors wallet. Bounty tokens will be minted to  bounty contract. Further minting of tokens in token contract is disabled. Transfers are unpaused in token contract. The ownership of the token
contract is not transferred. The token sale contract is useless from now
on. The token contract has no owner capable of acting.
It is possible to prolong the KYC period by waiting with the call of the finalization function.


Project Timeline
================



                    Date Event
  ---------------------- --------------------------------------------------------------
              2018-06-30 Token contract deployment
                         Bounty contract deployment
                         Token sale contract deployment
                         Transfer of token contract ownership to token sale contract
                         Etherscan code verification
                         Transfer of ownership of token sale contract to VREO
              2018-07-01 Start of ICONIQ sale
              2018-08-18 End of VREO sale
              2018-09-01 End of KYC period, Finalization possible


    Event                       Date
    ------------------------    ------------------------
    ICONIQ sale opening time    2018-07-01 10:00:00 CEST
    ICONIQ sale closing time    2018-07-14 22:00:00 CEST
    VREO sale opening time      2018-07-21 10:00:00 CEST
    VREO end of phase one       2018-07-24 22:00:00 CEST
    VREO end of phase two       2018-08-01 22:00:00 CEST
    VREO sale closing time      2018-08-18 22:00:00 CEST
    end of KYC verification     2018-09-01 22:00:00 CEST

Deployment Requirements
=======================

The following requirements have to be fulfilled at deployment time
2018-06-30:

                          Requirement Source         Value
  ----------------------------------- -------------- --------------------------------------------
              address of ICONIQ token ICONIQ         0xB3e2Cb7CccfE139f8FF84013823Bf22dA6B6390A     
          ICONIQ token needed per Wei ICONIQ
    Initial token sale contract owner VREO
                      Main ICO wallet VREO           
                      Advisors wallet VREO
                          Team wallet VREO    
                        Legals wallet VREO
     Ethereum address of bounty owner VREO
                 
                                    



         
