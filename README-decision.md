Decision task API


# Overview :

The decider is executed for each new decision task.

We have two types of Helper methods :

- helpers to inspect the event history (to find the state we are in)
- helpers to make decisions : schedule activities / child workflows / and timer

Decision helpers integrate flow control using the history helpers.

# Decisions

Important : does NOT call the activity now, it just adds it to the decisions array !

The decisions will then be sent in the decisionTaskResponse ( automagically done by aws-swf if noresponse has been sent yet.)

## 1. scheduling an activity :

schedule({
   name: obligatoire
   activity: obligatoire,
   input: { optional }
})

## Stopping the workflow

Stop()

## Starting a child workflow

Todo

Question : can it be recursive ? Of course !

## Starting a timer

Todo

## Fail execution

Todo


## Advanced: A second argument can be passed to the decision helpers :
        An object which contains raw SWF attributes


# Flow control

## ex step1 completed AND step2 failed
{
    completed: 'step1',
    failed: 'step2'
}

## step1 AND step2 completed :
{
    completed: ['step1', step2]
}

## step1 or step2 completed

TODO

## fn method for more complex conditions

{
    fn:  function () {
          return completed('step1', 'step2') || completed('step3');
    }
}

## Results-based conditions

You can also use results from a previous activity or the workflow input :


{
    fn:  function () {
          return completed('step1') && results('step1').questionA == 'yes';
    }
}

# Passing parameters

Input can be a function