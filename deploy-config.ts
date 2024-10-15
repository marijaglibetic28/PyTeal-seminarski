import * as algokit from '@algorandfoundation/algokit-utils'
import { CalculatorAppClient } from '../artifacts/CalculatorApp/client'

// Below is a showcase of various deployment options you can use in TypeScript Client
export async function deploy() {
  console.log('=== Deploying Calculator ===')

  const algod = algokit.getAlgoClient()
  const indexer = algokit.getAlgoIndexerClient()
  const deployer = await algokit.mnemonicAccountFromEnvironment({ name: 'DEPLOYER', fundWith: algokit.algos(3) }, algod)
  await algokit.ensureFunded(
    {
      accountToFund: deployer,
      minSpendingBalance: algokit.algos(2),
      minFundingIncrement: algokit.algos(2),
    },
    algod,
  )
  const appClient = new CalculatorAppClient(
    {
      resolveBy: 'creatorAndName',
      findExistingUsing: indexer,
      sender: deployer,
      creatorAddress: deployer.addr,
    },
    algod,
  )
  const app = await appClient.deploy({
    onSchemaBreak: 'append',
    onUpdate: 'append',
  })

  // If app was just created fund the app account
  if (['create', 'replace'].includes(app.operationPerformed)) {
    algokit.transferAlgos(
      {
        amount: algokit.algos(1),
        from: deployer,
        to: app.appAddress,
      },
      algod,
    )
  }

  const method1 = 'add'
  const response1 = await appClient.add({ num: 7 })
  console.log(`Called ${method1} on ${app.name} (${app.appId}), received: ${response1.return}`)

  const method = 'subtract'
  const response = await appClient.subtract({ num: 5 })
  console.log(`Called ${method} on ${app.name} (${app.appId}), received: ${response.return}`)
}
