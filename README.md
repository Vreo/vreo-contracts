MERO Token
==========

Solidity smart contracts for the VREO token and crowdsale contracts

| Field            | Value         |
|:-----------------|--------------:|
| Token name       |  MERO Token   |
| Token Ticker     |  MERO         |
| Decimals         |           18  |
| Total supply     |  700,000,000  |
| Token Sale       |  450,000,000  |
| Bounty           |   50,000,000  |
| Team             |   85,000,000  |
| Legals           |   57,000,000  |
| Advisors         |   58,000,000  |

Token Sales
===========

Post KYC Crowd Sale
-------------------

The token sale contract implements a new scheme for KYC verification. Everybody is able to invest ETH into the crowd sale but tokens are only minted after the KYC of the sending address is verified.
If an unverified investor sends ETH, tokens are not minted but the amount of pending tokens will be stored and issued when the address is verified by the owner of the token sale contract.
Once an address is verified it can invest and the token purchase will be processed instantly. Investors who send ETH and do not provide KYC information or investors that do not meet KYC requirements, can withdraw their investment after the end of the token sale.

ICONIQ Sale
-----------

There will be a presale period exclusively accessible by ICONIQ-Token holders. The amount of ETH an address can send is dependent on the amount of ICONIQ token it holds at the time of investment.
To check the amount of ETH investors are allowed to invest, the ICONIQ token balance of the investor is multiplied with a constant "ICONIQ token needed per Wei".
Investing ICONIQ holders will receive 30 % additional bonus tokens.

VREO Sale
---------

The VREO sale has 3 phases. In the first phase there will be a bonus of 20 % in second phase there will be a bonus of 10 %, in the third phase there will be no bonus.

Timeline
--------

  |Date                     | Event                                       |
  |-------------------------|---------------------------------------------|
  |2018-07-09 10:00:00 CEST | ICONIQ sale opening time                    |
  |2018-07-23 22:00:00 CEST | ICONIQ sale closing time                    |
  |2018-08-04 10:00:00 CEST | VREO sale opening time                      |
  |2018-08-07 22:00:00 CEST | VREO end of phase one                       |
  |2018-08-14 22:00:00 CEST | VREO end of phase two                       |
  |2018-09-01 22:00:00 CEST | VREO sale closing time                      |
  |2018-09-15 22:00:00 CEST | end of KYC verification                     |

Audit Report
============

In June 2018 the smart contracts were audited by [Solidified](https://solidified.io/).
A copy of the [final audit report](https://github.com/solidified-platform/audits/blob/master/Audit%20Report%20-%20VREO%20%5B06.29.18%5D.pdf) is filed within `/docs`.
