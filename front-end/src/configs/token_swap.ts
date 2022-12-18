export type TokenSwap = {
  "version": "0.1.0",
  "name": "token_swap",
  "instructions": [
    {
      "name": "initializeMint",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "swapAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenAMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializePool",
      "accounts": [
        {
          "name": "swapAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenA",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenB",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "transfer",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "receiver",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "srcTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dstTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "depositToken",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "swapAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "swapTokenA",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "swapTokenB",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawToken",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "swapAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "swapTokenA",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "swapTokenB",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swap",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "swapAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "sourceInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "swapSource",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "swapDestination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "swapAuthority",
            "type": "publicKey"
          },
          {
            "name": "isInitialized",
            "docs": [
              "Is the swap initialized, with data written to it"
            ],
            "type": "bool"
          },
          {
            "name": "bumpSeed",
            "docs": [
              "Bump seed used to generate the program address / authority"
            ],
            "type": "u8"
          },
          {
            "name": "tokenAAccount",
            "docs": [
              "Address of token A liquidity account"
            ],
            "type": "publicKey"
          },
          {
            "name": "tokenBAccount",
            "docs": [
              "Address of token B liquidity account"
            ],
            "type": "publicKey"
          },
          {
            "name": "poolMint",
            "docs": [
              "Address of pool token mint"
            ],
            "type": "publicKey"
          },
          {
            "name": "tokenAMint",
            "docs": [
              "Address of token A mint"
            ],
            "type": "publicKey"
          },
          {
            "name": "tokenBMint",
            "docs": [
              "Address of token B mint"
            ],
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TradeDirection",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "AtoB"
          },
          {
            "name": "BtoA"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "PoolIsNotInitilized",
      "msg": "Pool is not initialize"
    },
    {
      "code": 6001,
      "name": "AlreadyInUse",
      "msg": "Swap account already in use"
    },
    {
      "code": 6002,
      "name": "InvalidProgramAddress",
      "msg": "Invalid program address generated from bump seed and key"
    },
    {
      "code": 6003,
      "name": "InvalidOwner",
      "msg": "Input account owner is not the program address"
    },
    {
      "code": 6004,
      "name": "InvalidOutputOwner",
      "msg": "Output pool account owner cannot be the program address"
    },
    {
      "code": 6005,
      "name": "ExpectedMint",
      "msg": "Deserialized account is not an SPL Token mint"
    },
    {
      "code": 6006,
      "name": "ExpectedAccount",
      "msg": "Deserialized account is not an SPL Token account"
    },
    {
      "code": 6007,
      "name": "EmptySupply",
      "msg": "Input token account empty"
    },
    {
      "code": 6008,
      "name": "InvalidSupply",
      "msg": "Pool token mint has a non-zero supply"
    },
    {
      "code": 6009,
      "name": "InvalidDelegate",
      "msg": "Token account has a delegate"
    },
    {
      "code": 6010,
      "name": "InvalidInput",
      "msg": "InvalidInput"
    },
    {
      "code": 6011,
      "name": "IncorrectSwapAccount",
      "msg": "Address of the provided swap token account is incorrect"
    },
    {
      "code": 6012,
      "name": "IncorrectPoolMint",
      "msg": "Address of the provided pool token mint is incorrect"
    },
    {
      "code": 6013,
      "name": "InvalidOutput",
      "msg": "InvalidOutput"
    },
    {
      "code": 6014,
      "name": "CalculationFailure",
      "msg": "General calculation failure due to overflow or underflow"
    },
    {
      "code": 6015,
      "name": "InvalidInstruction",
      "msg": "Invalid instruction"
    },
    {
      "code": 6016,
      "name": "IncorrectTokenProgramId",
      "msg": "The provided token program does not match the token program expected by the swap"
    },
    {
      "code": 6017,
      "name": "RepeatedMint",
      "msg": "Swap input token accounts have the same mint"
    }
  ]
};

export const IDL: TokenSwap = {
  "version": "0.1.0",
  "name": "token_swap",
  "instructions": [
    {
      "name": "initializeMint",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "swapAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenAMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializePool",
      "accounts": [
        {
          "name": "swapAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenA",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenB",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "transfer",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "receiver",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "srcTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dstTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "depositToken",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "swapAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "swapTokenA",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "swapTokenB",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawToken",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "swapAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "swapTokenA",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "swapTokenB",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swap",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "swapAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "sourceInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "swapSource",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "swapDestination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "swapAuthority",
            "type": "publicKey"
          },
          {
            "name": "isInitialized",
            "docs": [
              "Is the swap initialized, with data written to it"
            ],
            "type": "bool"
          },
          {
            "name": "bumpSeed",
            "docs": [
              "Bump seed used to generate the program address / authority"
            ],
            "type": "u8"
          },
          {
            "name": "tokenAAccount",
            "docs": [
              "Address of token A liquidity account"
            ],
            "type": "publicKey"
          },
          {
            "name": "tokenBAccount",
            "docs": [
              "Address of token B liquidity account"
            ],
            "type": "publicKey"
          },
          {
            "name": "poolMint",
            "docs": [
              "Address of pool token mint"
            ],
            "type": "publicKey"
          },
          {
            "name": "tokenAMint",
            "docs": [
              "Address of token A mint"
            ],
            "type": "publicKey"
          },
          {
            "name": "tokenBMint",
            "docs": [
              "Address of token B mint"
            ],
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TradeDirection",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "AtoB"
          },
          {
            "name": "BtoA"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "PoolIsNotInitilized",
      "msg": "Pool is not initialize"
    },
    {
      "code": 6001,
      "name": "AlreadyInUse",
      "msg": "Swap account already in use"
    },
    {
      "code": 6002,
      "name": "InvalidProgramAddress",
      "msg": "Invalid program address generated from bump seed and key"
    },
    {
      "code": 6003,
      "name": "InvalidOwner",
      "msg": "Input account owner is not the program address"
    },
    {
      "code": 6004,
      "name": "InvalidOutputOwner",
      "msg": "Output pool account owner cannot be the program address"
    },
    {
      "code": 6005,
      "name": "ExpectedMint",
      "msg": "Deserialized account is not an SPL Token mint"
    },
    {
      "code": 6006,
      "name": "ExpectedAccount",
      "msg": "Deserialized account is not an SPL Token account"
    },
    {
      "code": 6007,
      "name": "EmptySupply",
      "msg": "Input token account empty"
    },
    {
      "code": 6008,
      "name": "InvalidSupply",
      "msg": "Pool token mint has a non-zero supply"
    },
    {
      "code": 6009,
      "name": "InvalidDelegate",
      "msg": "Token account has a delegate"
    },
    {
      "code": 6010,
      "name": "InvalidInput",
      "msg": "InvalidInput"
    },
    {
      "code": 6011,
      "name": "IncorrectSwapAccount",
      "msg": "Address of the provided swap token account is incorrect"
    },
    {
      "code": 6012,
      "name": "IncorrectPoolMint",
      "msg": "Address of the provided pool token mint is incorrect"
    },
    {
      "code": 6013,
      "name": "InvalidOutput",
      "msg": "InvalidOutput"
    },
    {
      "code": 6014,
      "name": "CalculationFailure",
      "msg": "General calculation failure due to overflow or underflow"
    },
    {
      "code": 6015,
      "name": "InvalidInstruction",
      "msg": "Invalid instruction"
    },
    {
      "code": 6016,
      "name": "IncorrectTokenProgramId",
      "msg": "The provided token program does not match the token program expected by the swap"
    },
    {
      "code": 6017,
      "name": "RepeatedMint",
      "msg": "Swap input token accounts have the same mint"
    }
  ]
};
