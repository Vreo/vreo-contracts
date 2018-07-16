Token Contract
===========

The token contract implements a ERC20 standard token. It is named MERO Token.
Ticker symbol will be MERO.
The number of decimals will be 18 to keep the MERO resolution identical to ETH.

The token contract emits the standard ERC20 events including a transfer event to address 0x0 in case of minting tokens.

We rely on the broadly trusted Open Zeppelin v1.9.0 implementation of an ERC20 compliant Token. The following extensions are used:

Capped and Mintable
-------------------

Tokens are minted on demand by the owner of the token contract.
Therefore the ownership of the token contract has to be transferred to the token sale contract. The minting of tokens is capped at 700,000,000.

Pausable
--------

Transfer of tokens is paused on construction of the token contract.
Transfer of tokens is unpaused on finalization of the token sale
contract. No transfer of tokens is possible until finalization of the token sale.

Owned
-----

Minting and pausing functions are restricted to the token contract
owner. The ownership of the token contract is transferred to the token sale contract immediately after deployment.

Burnable
--------

Token can be irreversibly burned (destroyed) by the token holder at any
time.

Token Sale Contract
===================

The Token sale contract is a Minted and Finalizable Crowd sale from the Open Zeppelin framework (v1.9.0).

Post KYC crowd sale
-------------------

The token sale contract uses a new scheme for KYC verification. Every investor is able to invest ETH into the crowd sale but tokens are only minted after the KYC of the sending address is verified.
If an unverified investor sends ETH, tokens are not minted but the amount of pending tokens will be stored and issued when the address is verified by the owner of the token sale contract as long as the token cap of the sale is not exceeded.
The verification should process multiple addresses in one transaction.
Once an address is verified it can invest and the token purchase will be processed instantly. Investors who send ETH and do not provide KYC information or investors that do not meet KYC requirements, can withdraw their investment after the end of the token sale.

Bounty contract
---------------

The Bounty tokens will be minted to the bounty contract during finalization. The owner the bounty contract can distribute tokens to bounty recipients. The bounty contract works like an airdrop. The owner sends a list of addresses and amounts to the bounty contract, which transfers the tokens to each bounty recipient on the list.


Set Rate
--------

The token sale contract provides a function that enables the token
contract owner to set the MERO Token price at any time. The
price represents the MERO per ETH rate. With a target
price of 0.05 $ per MERO we will have a rate of
approximately 9,000 according to a price of approximately 450 $ per ETH.
There is a sanity check, that allows to change the rate only by one order of magnitude up or down.


Token pools
-----------

  |Pool            |           Cap |distribution time                         |
  |----------------|---------------|------------------------------------------|
  |private Presale |        no cap | any time before end of VREO sale         |
  |ICONIQ sale	   |        no cap | between start and end date of ICONIQ sale|
  |VREO sale       |        no cap | between start and end date of VREO sale  |
  |total sale cap  |   450,000,000 | before end of VREO sale                  |
  |Bounty          |    50,000,000 | at finalization                          |
  |Team            |    85,000,000 | at finalization                          |
  |Legals          |    57,000,000 | at finalization                          |
  |Advisors        |    58,000,000 | at finalization                          |
  |Token Cap       |   700,000,000 |                                          |




Private sale
---------------

At any time before the end of the VREO sale, tokens can be issued to private presale investors by the owner of the token sale contract. The token sale contract can process a lists containing the amounts of tokens assigned to presale buyer addresses.

ICONIQ sale
-----------
The  public token sale consists of the two stages ICONIQ sale and VREO sale
The ICONIQ sale will be a presale period exclusively accessible by ICONIQ-Token holders. The amount of ETH an address can send is dependent on the amount of ICONIQ token it holds at the time of investment.
To check the amount of ETH, investors are allowed to send, the ICONIQ token balance of the investor is multiplied with a constant "ICONIQ token needed per Wei" (in this context ICONIQ token means integral tokens quantums). One could also calculate with ICONIQ/ETH, since ETH, MERO and ICONIQ have the same decimals.
Investors participating in the ICONIQ presale will get a bonus of 30%

VREO sale
---------

The VREO sale has 3 phases. In the first phase there will be a bonus of 20 % in the second phase there will be a bonus of 10 %,  in the third phase there will be no bonus.

KYC verification period
-----------------------

After the end of the VREO sale there is a guaranteed minimal period in which investors have time to pass the KYC requirements. The finalization function can only be called after the KYC verification period has ended.


Finalization
------------

After the end of the KYC verification period the finalization stage
takes place. Legals tokens will be minted to legals wallet. Advisor  tokens will be minted to advisors wallet. Team  tokens will be minted to team wallet. Bounty tokens will be minted to  bounty contract. Further minting of tokens in token contract is disabled. Transfers are unpaused in token contract. The ownership of the token contract is not transferred. The token sale contract is useless from now on. The token contract has no owner capable of acting, which means the token is not pausable.
It is possible to prolong the KYC period by waiting with the call of the finalization function.


Project Timeline
================


  |Date                  | Event                                             |
  |----------------------|---------------------------------------------------|
  |           2018-07-05 | Token contract deployment                         |
  |                      | Bounty contract deployment                        |
  |                      | Token sale contract deployment                    |
  |                      | Transfer of token ownership to token sale contract|
  |                      | Etherscan code verification                       |
  |           2018-07-09 | Start of ICONIQ sale                              |
  |           2018-09-01 | End of VREO sale                                  |
  |           2018-09-15 | End of KYC period, Finalization possible          |


Smart Contract Timeline
=======================


  |Date                     | Event                                       |
  |-------------------------|---------------------------------------------|
  |2018-07-09 10:00:00 CEST | ICONIQ sale opening time                    |
  |2018-07-23 22:00:00 CEST | ICONIQ sale closing time                    |
  |2018-08-04 10:00:00 CEST | VREO sale opening time                      |
  |2018-08-07 22:00:00 CEST | VREO end of phase one                       |
  |2018-08-14 22:00:00 CEST | VREO end of phase two                       |
  |2018-09-01 22:00:00 CEST | VREO sale closing time                      |
  |2018-09-15 22:00:00 CEST | end of KYC verification                     |


Deployment Requirements
=======================

The following requirements have to be fulfilled at deployment time
2018-06-30:

|Requirement                | Source |       Value                              |
|---------------------------|--------|------------------------------------------|
|address of ICONIQ token    | ICONIQ |0xB3e2Cb7CccfE139f8FF84013823Bf22dA6B6390A|   
|ICONIQ token needed per Wei| ICONIQ | 450                                      |
|Token sale contract owner  | VREO   |0x4d1Fca0E78D7f5C6eDBc64206BcEFb4eEA0a72c3|
|Main ICO wallet            | VREO   |0x850B320Ab48db9015F64c41F260283287E50D047|
|Advisors wallet            | VREO   |0x021B92178144BDf2288F4986eFB7d06AAAdB19F8|
|Team wallet                | VREO   |0x481481dd253fEd1888254805944c9412eb0A987D|
|Legals wallet              | VREO   |0xa085ED2744ab0e502BD3694ffcB7610B54C627AD|
|Address of bounty owner    | VREO   |0x4d1Fca0E78D7f5C6eDBc64206BcEFb4eEA0a72c3|

Deployment method
-----------------

The contracts will be deployed manually, using remixd and mist on a synchronized full node.
